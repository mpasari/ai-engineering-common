# BACKEND_PATTERNS.md
# SDLC -- Engineering Stage -- Backend Implementation Patterns
# Version: 1.0.0
# Status: Active
# Last updated: 2025-01
# Owner: CoE Core
#
# This file is read by:
#   - Code Gen Agent (A09) -- selects correct pattern for the task
#   - Refactor Agent (A10) -- identifies which pattern to migrate to
#   - Peer Review Agent (A27) -- checks code follows approved patterns

---

## 1. Layered architecture

All backend services follow a four-layer architecture. Generated code
must respect these boundaries -- no layer may skip a layer below it.

```
Controller (API)
  -- Handles HTTP or Kafka, validates input, delegates to Application
  -- No business logic
  -- Returns standard error format from API_DESIGN_STANDARDS.md

Application Service
  -- Orchestrates domain logic and infrastructure calls
  -- Loads domain objects, calls domain methods, persists results
  -- Publishes domain events after successful persistence
  -- Transaction boundary (one transaction per use case)

Domain
  -- Business rules, invariants, state machine
  -- No infrastructure dependencies (no repositories, no HTTP clients)
  -- Entities, value objects, domain services
  -- Raises domain events (not publishes -- application layer publishes)

Infrastructure
  -- JPA repositories, HTTP clients, Kafka producers
  -- Implements domain interfaces
  -- No business logic
```

---

## 2. Java / Spring Boot patterns

### 2.1 Controller pattern

```java
@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final CancelOrderUseCase cancelOrderUseCase;

    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @PathVariable UUID orderId,
            @Valid @RequestBody CancelOrderRequest request,
            @AuthenticationPrincipal Jwt jwt) {

        var command = CancelOrderCommand.of(orderId, request.reason(), jwt.getSubject());
        var result = cancelOrderUseCase.execute(command);
        return ResponseEntity.ok(ApiResponse.success(OrderResponse.from(result)));
    }
}
```

Key rules:
- Controller accepts a command/request object -- validates with @Valid
- Controller delegates immediately -- no business logic
- Returns ApiResponse wrapper (from API_DESIGN_STANDARDS.md section 5)
- @AuthenticationPrincipal Jwt for extracting user identity

### 2.2 Application service pattern

```java
@Service
@RequiredArgsConstructor
@Transactional
public class CancelOrderUseCase {

    private final OrderRepository orderRepository;
    private final DomainEventPublisher eventPublisher;

    public Order execute(CancelOrderCommand command) {
        var order = orderRepository.findById(command.orderId())
            .orElseThrow(() -> new OrderNotFoundException(command.orderId()));

        order.cancel(command.reason(), command.cancelledBy());

        var saved = orderRepository.save(order);
        eventPublisher.publish(saved.domainEvents());
        saved.clearDomainEvents();

        return saved;
    }
}
```

Key rules:
- @Transactional at the use case level -- one transaction per use case
- Load, call domain method, save, publish events -- always in this order
- Events published AFTER successful save -- never before
- Never catch and swallow exceptions -- let them propagate

### 2.3 Domain entity pattern

```java
@Entity
@Table(name = "orders")
public class Order {

    @Id
    private UUID id;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    @Transient
    private final List<DomainEvent> domainEvents = new ArrayList<>();

    public void cancel(String reason, String cancelledBy) {
        if (!this.status.canTransitionTo(OrderStatus.CANCELLED)) {
            throw new InvalidOrderStateException(this.id, this.status, OrderStatus.CANCELLED);
        }
        this.status = OrderStatus.CANCELLED;
        this.cancellationReason = reason;
        this.cancelledBy = cancelledBy;
        this.cancelledAt = Instant.now();
        domainEvents.add(new OrderCancelledEvent(this.id, reason));
    }

    public List<DomainEvent> domainEvents() {
        return Collections.unmodifiableList(domainEvents);
    }
}
```

Key rules:
- Business rules enforced inside domain methods -- not in application service
- State transitions validated before applying
- Domain events raised inside the entity -- not outside
- @Transient for domain events -- not persisted

### 2.4 Repository pattern

```java
public interface OrderRepository extends JpaRepository<Order, UUID> {

    // Named queries -- prefer JPQL over native SQL
    @Query("SELECT o FROM Order o WHERE o.customerId = :customerId AND o.status = :status")
    Page<Order> findByCustomerIdAndStatus(
        @Param("customerId") UUID customerId,
        @Param("status") OrderStatus status,
        Pageable pageable);

    // Always paginated for list queries -- never return unbounded List<>
    // Use JOIN FETCH for related collections to prevent N+1
    @Query("SELECT o FROM Order o JOIN FETCH o.items WHERE o.id = :id")
    Optional<Order> findByIdWithItems(@Param("id") UUID id);
}
```

Key rules:
- List queries always return Page<T> -- never List<T> without a limit
- Use JOIN FETCH for related collections (prevents N+1 -- P01 rule)
- Named @Param annotations on all parameters

---

## 3. TypeScript / Node.js patterns

### 3.1 Controller pattern

```typescript
// Express or Next.js API route
export async function cancelOrder(req: Request, res: Response): Promise<void> {
    const { orderId } = req.params;
    const { reason } = validateCancelOrderRequest(req.body); // throws on invalid
    const userId = req.auth.sub;

    const result = await cancelOrderUseCase.execute({ orderId, reason, userId });
    res.status(200).json({ data: toOrderResponse(result) });
}
```

### 3.2 Use case pattern

```typescript
export class CancelOrderUseCase {
    constructor(
        private readonly orderRepo: OrderRepository,
        private readonly eventBus: EventBus,
    ) {}

    async execute(command: CancelOrderCommand): Promise<Order> {
        return await this.orderRepo.transaction(async (tx) => {
            const order = await this.orderRepo.findById(command.orderId, tx);
            if (!order) throw new OrderNotFoundError(command.orderId);

            order.cancel(command.reason, command.userId);

            const saved = await this.orderRepo.save(order, tx);
            await this.eventBus.publish(order.domainEvents());

            return saved;
        });
    }
}
```

---

## 4. Error handling patterns

### 4.1 Exception hierarchy (Java)

```java
// Base -- maps to 500 Internal Server Error
public abstract class ApplicationException extends RuntimeException { }

// Maps to 404 Not Found
public class OrderNotFoundException extends ApplicationException { }

// Maps to 422 Unprocessable Entity (business rule violation)
public class InvalidOrderStateException extends ApplicationException { }

// Maps to 403 Forbidden
public class InsufficientPermissionsException extends ApplicationException { }
```

Global exception handler maps to API error format per API_DESIGN_STANDARDS.md.

### 4.2 Never swallow exceptions

```java
// FORBIDDEN
try {
    orderService.cancel(orderId);
} catch (Exception e) {
    log.error("Error", e);
    // silently continues -- caller has no idea what happened
}

// REQUIRED
// Let exceptions propagate to the global handler.
// If you need to add context: wrap and rethrow.
try {
    orderService.cancel(orderId);
} catch (OrderNotFoundException e) {
    throw new OrderNotFoundException(orderId, "cancellation", e);
}
```

---

## 5. Approved external call patterns

```java
// REQUIRED: timeout always configured
@Bean
RestClient orderClient(@Value("${integrations.order-service.base-url}") String baseUrl) {
    return RestClient.builder()
        .baseUrl(baseUrl)
        .requestInterceptor(new BearerTokenInterceptor())
        .build();
}

// In service: handle failure explicitly
try {
    return orderClient.get()
        .uri("/api/v1/orders/{id}", orderId)
        .retrieve()
        .body(OrderDto.class);
} catch (HttpClientErrorException.NotFound e) {
    throw new OrderNotFoundException(orderId);
} catch (RestClientException e) {
    throw new ExternalServiceException("order-service", e);
}
```

---

## 6. Version and review

| File owner | CoE Core |
| Review cadence | Quarterly |
