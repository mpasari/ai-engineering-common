# CODING_STANDARDS.md
# AI Engineering Commons -- Coding Standards for All Code Generation
# Version: 1.0.0
# Status: Active
# Last updated: 2026-04
# Owner: CoE Core + Tech Lead representatives

---

## 1. Purpose

This file defines the coding conventions that all agents must follow when
generating, reviewing, or modifying code. It covers naming, structure,
formatting, and language-specific idioms for the three primary stacks in
use across Telia engineering teams: Java, TypeScript/React, and C#.

Referenced by:
- `agents/CODE_GEN_AGENT.md` -- primary consumer, applies these on every generation
- `agents/REFACTOR_AGENT.md` -- applies these when modernising existing code
- `agents/PEER_REVIEW_AGENT.md` -- checks every PR against these standards
- `scripts/cli.js` -- merges this file into `.cursorrules` for Cursor IDE
- `SECURITY_STANDARDS.md` -- security rules complement these coding rules

When a project team diverges from any standard defined here, they place an
override file at `.ai/project/OVERRIDES/CODING_STANDARDS.md` with the
specific divergence, the reason, and the approver documented at the top.
The override takes precedence for that project only.

---

## 2. Universal rules -- all languages

These rules apply regardless of language or framework.

### 2.1 Naming

| Concept | Rule |
|---|---|
| Names must be descriptive | A name should tell the reader what the thing is or does without needing a comment |
| No single-letter variables | Except loop counters (`i`, `j`) and well-established conventions (`e` for exception) |
| No abbreviations unless universal | `id`, `url`, `api`, `dto`, `http` are acceptable. `usr`, `cnt`, `mgr`, `proc` are not |
| No hungarian notation | No `strName`, `intCount`, `bIsValid` |
| Booleans are questions | Name booleans as questions: `isActive`, `hasPermission`, `canDelete`, `isEmpty` |
| Collections are plural | `users`, `orders`, `eventIds` -- not `userList`, `orderArray` |
| Constants are descriptive | `MAX_RETRY_ATTEMPTS` not `MAX` or `N` |

### 2.2 Functions and methods

| Rule | Detail |
|---|---|
| One responsibility | A function does one thing. If you need "and" to describe what it does, split it. |
| Maximum 30 lines | If a function exceeds 30 lines, it is a candidate for extraction. Flag for Tech Lead review. |
| Maximum 4 parameters | More than 4 parameters → introduce a parameter object |
| No boolean parameters | `sendEmail(user, true)` -- what does `true` mean? Use named methods or enums instead |
| Early return | Validate and return early rather than nesting if/else deeply |
| Command-query separation | A function either returns a value or causes a side effect -- not both |

```java
// BAD -- does too many things, boolean parameter, unclear
public User processUser(User user, boolean sendEmail) {
    // validation
    // business logic
    // persistence
    // email sending
    // return
}

// GOOD -- single responsibility, clear intent
public User validateAndSave(User user) { ... }
public void notifyUserCreated(User user) { ... }
```

### 2.3 Comments

| Rule | Detail |
|---|---|
| Code explains what, comments explain why | If you need a comment to explain what code does, the code needs to be clearer |
| No commented-out code | Delete it -- version control preserves history |
| No TODO without a ticket | `// TODO: fix this` is forbidden. `// TODO: PROJ-123 -- fix edge case` is acceptable |
| Document public APIs | All public methods, classes, and interfaces must have doc comments |
| No misleading comments | A comment that contradicts the code is worse than no comment |

### 2.4 Error handling

| Rule | Detail |
|---|---|
| Never swallow exceptions | `catch (Exception e) {}` is forbidden -- always log or rethrow |
| Catch specific exceptions | Catch the narrowest exception type that makes sense |
| Fail fast | Validate inputs at the boundary of a function, not deep inside |
| Meaningful error messages | Error messages must include context: what was attempted, what failed, relevant identifiers |
| No error codes as magic numbers | Use named constants or enums for error codes |

```java
// FORBIDDEN -- swallowed exception
try {
    processOrder(order);
} catch (Exception e) {
    // do nothing
}

// FORBIDDEN -- generic catch with no context
} catch (Exception e) {
    log.error("Error occurred");
}

// REQUIRED -- specific catch with context
} catch (OrderProcessingException e) {
    log.error("Failed to process order {}: {}", order.getId(), e.getMessage());
    throw new ServiceException("Order processing failed for order " + order.getId(), e);
}
```

### 2.5 Code structure

| Rule | Detail |
|---|---|
| Files have one primary responsibility | One class per file (Java/C#), one component per file (React) |
| Maximum file length 300 lines | Longer files are candidates for splitting -- flag for Tech Lead review |
| Consistent import ordering | See language-specific sections below |
| No magic numbers | Replace literal numbers with named constants |
| No deep nesting | Maximum 3 levels of nesting -- extract methods to reduce depth |

---

## 3. Java standards

### 3.1 Naming conventions

| Construct | Convention | Example |
|---|---|---|
| Class | PascalCase, noun | `OrderService`, `PaymentProcessor` |
| Interface | PascalCase, noun or adjective | `Auditable`, `OrderRepository` |
| Method | camelCase, verb | `processOrder()`, `findById()` |
| Variable | camelCase, noun | `orderCount`, `currentUser` |
| Constant | UPPER_SNAKE_CASE | `MAX_RETRY_ATTEMPTS` |
| Package | lowercase, no underscores | `com.telia.order.service` |
| Test class | Same as class + `Test` suffix | `OrderServiceTest` |
| Test method | `should_[expected]_when_[condition]` | `should_throw_when_order_is_null` |

### 3.2 Package structure

All services follow this package structure:

```
com.telia.[domain].[service-name]/
  ├── api/              # REST controllers, request/response DTOs
  ├── application/      # Use cases, application services, command/query handlers
  ├── domain/           # Domain entities, value objects, domain services, repository interfaces
  ├── infrastructure/   # Repository implementations, external API clients, messaging
  └── config/           # Spring configuration classes
```

### 3.3 Spring Boot patterns

```java
// Controller -- thin, delegates to application service
@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderApplicationService orderService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse createOrder(@Valid @RequestBody CreateOrderRequest request) {
        return orderService.createOrder(request);
    }
}

// Application service -- orchestrates domain logic, no business rules here
@Service
@Transactional
@RequiredArgsConstructor
public class OrderApplicationService {

    private final OrderRepository orderRepository;
    private final OrderDomainService orderDomainService;
    private final OrderEventPublisher eventPublisher;

    public OrderResponse createOrder(CreateOrderRequest request) {
        Order order = orderDomainService.createOrder(request.toCommand());
        orderRepository.save(order);
        eventPublisher.publish(new OrderCreatedEvent(order.getId()));
        return OrderResponse.from(order);
    }
}

// Domain entity -- contains business rules
@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    // Business rule lives here, not in the service
    public void cancel(String reason) {
        if (this.status == OrderStatus.DELIVERED) {
            throw new OrderCannotBeCancelledException(
                "Cannot cancel delivered order " + this.id);
        }
        this.status = OrderStatus.CANCELLED;
        this.cancellationReason = reason;
    }
}
```

### 3.4 Repository pattern

```java
// Repository interface lives in domain -- no JPA annotations here
public interface OrderRepository {
    Optional<Order> findById(UUID id);
    Order save(Order order);
    List<Order> findByCustomerId(UUID customerId);
}

// JPA implementation lives in infrastructure
@Repository
@RequiredArgsConstructor
public class JpaOrderRepository implements OrderRepository {

    private final OrderJpaRepository jpa; // Spring Data JPA interface

    @Override
    public Optional<Order> findById(UUID id) {
        return jpa.findById(id).map(OrderEntity::toDomain);
    }
}
```

### 3.5 Required annotations and patterns

| Pattern | Rule |
|---|---|
| `@RequiredArgsConstructor` | Use Lombok for constructor injection -- no `@Autowired` on fields |
| `@Valid` on request bodies | Always validate incoming DTOs |
| `@Transactional` on service methods | Application service methods that write must be transactional |
| `@Slf4j` | Use Lombok for logging -- no manual `LoggerFactory.getLogger()` |
| `Optional` return types | Repository find methods return `Optional<T>`, never `null` |
| Record classes for DTOs | Use Java records for immutable DTOs where possible (Java 16+) |

### 3.6 Import ordering

```java
// Order imports as follows (enforced by Checkstyle):
// 1. Java standard library
import java.util.List;
import java.util.Optional;

// 2. Jakarta/javax
import jakarta.validation.Valid;

// 3. Spring framework
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// 4. Third-party libraries
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

// 5. Internal (com.telia.*)
import com.telia.order.domain.Order;
```

### 3.7 Testing standards

```java
// Test structure -- Arrange / Act / Assert with clear separation
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private OrderApplicationService orderService;

    @Test
    void should_create_order_when_request_is_valid() {
        // Arrange
        CreateOrderRequest request = CreateOrderRequest.builder()
            .customerId(UUID.randomUUID())
            .items(List.of(new OrderItem("SKU-001", 2)))
            .build();
        Order savedOrder = Order.create(request.toCommand());
        when(orderRepository.save(any())).thenReturn(savedOrder);

        // Act
        OrderResponse response = orderService.createOrder(request);

        // Assert
        assertThat(response.getId()).isNotNull();
        assertThat(response.getStatus()).isEqualTo(OrderStatus.PENDING);
        verify(orderRepository).save(any(Order.class));
    }
}
```

---

## 4. TypeScript / React standards

### 4.1 Naming conventions

| Construct | Convention | Example |
|---|---|---|
| Component | PascalCase | `OrderSummary`, `PaymentForm` |
| Hook | camelCase, `use` prefix | `useOrderStatus`, `usePaymentFlow` |
| Type / Interface | PascalCase | `OrderSummaryProps`, `UserProfile` |
| Enum | PascalCase | `OrderStatus`, `PaymentMethod` |
| Function | camelCase, verb | `fetchOrders()`, `handleSubmit()` |
| Variable | camelCase | `orderCount`, `isLoading` |
| Constant | UPPER_SNAKE_CASE | `MAX_ITEMS_PER_PAGE` |
| File -- component | PascalCase | `OrderSummary.tsx` |
| File -- hook | camelCase | `useOrderStatus.ts` |
| File -- utility | camelCase | `formatCurrency.ts` |
| File -- type | camelCase | `orderTypes.ts` |

### 4.2 Component structure

```typescript
// Required component structure -- props type first, component second
interface OrderSummaryProps {
  orderId: string;
  onCancel: (orderId: string) => void;
  className?: string;
}

// Use function declarations, not arrow functions, for components
export function OrderSummary({ orderId, onCancel, className }: OrderSummaryProps) {
  const { order, isLoading, error } = useOrderDetails(orderId);

  if (isLoading) return <LoadingSpinner />;
  if (error)     return <ErrorMessage error={error} />;
  if (!order)    return null;

  return (
    <div className={cn('order-summary', className)}>
      <OrderHeader order={order} />
      <OrderItems items={order.items} />
      <OrderActions orderId={orderId} onCancel={onCancel} />
    </div>
  );
}
```

### 4.3 TypeScript rules

| Rule | Detail |
|---|---|
| No `any` type | Use `unknown` if the type is genuinely unknown, then narrow it |
| Explicit return types on functions | All exported functions must have explicit return type annotations |
| Prefer `interface` over `type` for objects | Use `type` for unions, intersections, and primitives |
| Use `readonly` for immutable data | Mark arrays and objects that should not be mutated as `readonly` |
| Use `zod` for runtime validation | All data from external sources (API responses, form inputs) validated with zod |
| No non-null assertion (`!`) | Prove to TypeScript something is non-null rather than asserting it |
| Strict mode enabled | `"strict": true` in `tsconfig.json` -- no exceptions |

```typescript
// FORBIDDEN
function processData(data: any) { ... }
const user = users.find(u => u.id === id)!;

// REQUIRED
function processData(data: unknown): ProcessedData {
  const validated = processedDataSchema.parse(data); // zod validates at runtime
  return validated;
}
const user = users.find(u => u.id === id);
if (!user) throw new Error(`User ${id} not found`);
```

### 4.4 Hook patterns

```typescript
// Custom hooks -- always return named properties, never positional arrays
// (except when mimicking useState for simple cases)
export function useOrderDetails(orderId: string) {
  const [order, setOrder]     = useState<Order | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError]     = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchOrder(orderId)
      .then(data  => { if (!cancelled) { setOrder(data); setLoading(false); } })
      .catch(err  => { if (!cancelled) { setError(err);  setLoading(false); } });

    return () => { cancelled = true; }; // cleanup prevents state update on unmount
  }, [orderId]);

  return { order, isLoading, error };
}
```

### 4.5 File and folder structure

```
src/
  components/
    OrderSummary/
      OrderSummary.tsx        # Component
      OrderSummary.test.tsx   # Tests alongside component
      OrderSummary.module.css # Styles (if CSS modules used)
      index.ts                # Barrel export
  hooks/
    useOrderDetails.ts
    useOrderDetails.test.ts
  types/
    orderTypes.ts
  utils/
    formatCurrency.ts
    formatCurrency.test.ts
  pages/                      # Next.js pages or React Router views
  api/                        # API client functions
```

### 4.6 Testing standards

```typescript
// Use React Testing Library -- test behaviour, not implementation
describe('OrderSummary', () => {
  it('shows loading state while fetching order', () => {
    mockUseOrderDetails({ isLoading: true, order: null, error: null });
    render(<OrderSummary orderId="order-1" onCancel={jest.fn()} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('calls onCancel with orderId when cancel button clicked', async () => {
    const handleCancel = jest.fn();
    mockUseOrderDetails({ isLoading: false, order: mockOrder, error: null });
    render(<OrderSummary orderId="order-1" onCancel={handleCancel} />);

    await userEvent.click(screen.getByRole('button', { name: /cancel order/i }));

    expect(handleCancel).toHaveBeenCalledWith('order-1');
  });
});
```

---

## 5. C# standards

### 5.1 Naming conventions

| Construct | Convention | Example |
|---|---|---|
| Class | PascalCase | `OrderService`, `PaymentProcessor` |
| Interface | PascalCase, `I` prefix | `IOrderRepository`, `IPaymentGateway` |
| Method | PascalCase | `ProcessOrder()`, `FindById()` |
| Property | PascalCase | `OrderStatus`, `CustomerId` |
| Private field | camelCase, underscore prefix | `_orderRepository`, `_logger` |
| Local variable | camelCase | `orderCount`, `currentUser` |
| Constant | PascalCase | `MaxRetryAttempts` |
| Async method | PascalCase + `Async` suffix | `ProcessOrderAsync()` |
| Enum | PascalCase | `OrderStatus`, `PaymentMethod` |

### 5.2 Project structure

```
Solution/
  src/
    [ServiceName].Api/           # Controllers, middleware, program.cs
    [ServiceName].Application/   # Use cases, commands, queries, handlers
    [ServiceName].Domain/        # Entities, value objects, domain events, interfaces
    [ServiceName].Infrastructure/# EF Core, external APIs, messaging
  tests/
    [ServiceName].UnitTests/
    [ServiceName].IntegrationTests/
```

### 5.3 Async patterns

```csharp
// ALL I/O operations must be async -- no .Result or .Wait()
// FORBIDDEN
public Order GetOrder(Guid id)
{
    return _repository.FindByIdAsync(id).Result; // deadlock risk
}

// REQUIRED
public async Task<Order> GetOrderAsync(Guid id)
{
    return await _repository.FindByIdAsync(id);
}

// Use ConfigureAwait(false) in library code (not in ASP.NET controllers)
public async Task<Order> FindByIdAsync(Guid id)
{
    return await _context.Orders
        .FirstOrDefaultAsync(o => o.Id == id)
        .ConfigureAwait(false);
}
```

### 5.4 Dependency injection patterns

```csharp
// Constructor injection -- always, no property injection
public class OrderApplicationService
{
    private readonly IOrderRepository _orderRepository;
    private readonly IOrderDomainService _domainService;
    private readonly ILogger<OrderApplicationService> _logger;

    public OrderApplicationService(
        IOrderRepository orderRepository,
        IOrderDomainService domainService,
        ILogger<OrderApplicationService> logger)
    {
        _orderRepository = orderRepository
            ?? throw new ArgumentNullException(nameof(orderRepository));
        _domainService = domainService
            ?? throw new ArgumentNullException(nameof(domainService));
        _logger = logger
            ?? throw new ArgumentNullException(nameof(logger));
    }
}
```

### 5.5 Record types and immutability

```csharp
// Use records for DTOs and value objects -- immutable by default
public record CreateOrderRequest(
    Guid CustomerId,
    IReadOnlyList<OrderItemRequest> Items
);

public record OrderResponse(
    Guid Id,
    string Status,
    decimal TotalAmount,
    DateTimeOffset CreatedAt
);

// Value objects in domain -- use records with validation
public record Money
{
    public decimal Amount { get; }
    public string Currency { get; }

    public Money(decimal amount, string currency)
    {
        if (amount < 0) throw new ArgumentException("Amount cannot be negative");
        if (string.IsNullOrWhiteSpace(currency)) throw new ArgumentException("Currency required");
        Amount = amount;
        Currency = currency.ToUpperInvariant();
    }
}
```

### 5.6 Error handling and result pattern

```csharp
// Use Result pattern for expected failures -- no exceptions for flow control
public class Result<T>
{
    public bool IsSuccess { get; }
    public T? Value { get; }
    public string? Error { get; }

    private Result(bool isSuccess, T? value, string? error)
    {
        IsSuccess = isSuccess;
        Value = value;
        Error = error;
    }

    public static Result<T> Success(T value) => new(true, value, null);
    public static Result<T> Failure(string error) => new(false, default, error);
}

// Usage
public async Task<Result<Order>> ProcessOrderAsync(CreateOrderCommand command)
{
    var customer = await _customerRepository.FindByIdAsync(command.CustomerId);
    if (customer is null)
        return Result<Order>.Failure($"Customer {command.CustomerId} not found");

    var order = _domainService.CreateOrder(customer, command);
    await _orderRepository.SaveAsync(order);
    return Result<Order>.Success(order);
}
```

### 5.7 Testing standards

```csharp
// xUnit + FluentAssertions + Moq
public class OrderApplicationServiceTests
{
    private readonly Mock<IOrderRepository> _repositoryMock = new();
    private readonly OrderApplicationService _sut;

    public OrderApplicationServiceTests()
    {
        _sut = new OrderApplicationService(
            _repositoryMock.Object,
            new OrderDomainService(),
            Mock.Of<ILogger<OrderApplicationService>>());
    }

    [Fact]
    public async Task ProcessOrderAsync_ShouldReturnFailure_WhenCustomerNotFound()
    {
        // Arrange
        var command = new CreateOrderCommand(CustomerId: Guid.NewGuid(), Items: []);
        _repositoryMock.Setup(r => r.FindByIdAsync(command.CustomerId))
                       .ReturnsAsync((Order?)null);

        // Act
        var result = await _sut.ProcessOrderAsync(command);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain(command.CustomerId.ToString());
    }
}
```

---

## 6. Git and commit standards

These apply across all languages and projects.

### 6.1 Commit message format

All commits must follow Conventional Commits format. This is what the
Release Agent uses to generate changelogs automatically.

```
<type>(<scope>): <short description>

[optional body]

[optional footer: BREAKING CHANGE, Closes #ticket]
```

**Types:**

| Type | When to use |
|---|---|
| `feat` | New feature or capability |
| `fix` | Bug fix |
| `refactor` | Code change that is neither a fix nor a feature |
| `test` | Adding or updating tests |
| `docs` | Documentation only |
| `chore` | Build, tooling, dependency updates |
| `perf` | Performance improvement |
| `ci` | CI/CD pipeline changes |
| `revert` | Reverting a previous commit |

**Examples:**

```
feat(orders): add order cancellation endpoint

Implements POST /api/v1/orders/{id}/cancel with reason field.
Publishes OrderCancelledEvent to Kafka topic order-events.

Closes PROJ-412
```

```
fix(auth): prevent token refresh race condition

Multiple concurrent requests could obtain multiple refresh tokens.
Added distributed lock via Redis to serialise refresh operations.

Closes PROJ-398
```

### 6.2 Branch naming

```
feature/PROJ-412-order-cancellation
fix/PROJ-398-token-refresh-race
refactor/PROJ-445-extract-payment-domain
chore/PROJ-501-upgrade-spring-boot-3-3
```

### 6.3 PR size guidelines

| PR size | Lines changed | Guidance |
|---|---|---|
| Small | < 200 lines | Ideal -- fast to review, easy to understand |
| Medium | 200-500 lines | Acceptable -- add extra context in PR description |
| Large | 500-1000 lines | Requires Tech Lead justification -- consider splitting |
| Extra large | > 1000 lines | Requires splitting unless it is a generated migration |

---

## 7. What agents check against this file

The Peer Review Agent checks every PR against these standards. Violations
are categorised as:

| Severity | Examples | Action |
|---|---|---|
| BLOCK | Swallowed exceptions, `any` type in TypeScript, `.Result` on async in C# | Must fix before merge |
| WARN | Function over 30 lines, file over 300 lines, missing doc comment on public API | Flagged for Tech Lead -- merge allowed with acknowledgement |
| INFO | Naming suggestions, import ordering, minor style inconsistencies | Noted in review -- no action required |

---

## 8. Version and review

| Attribute | Value |
|---|---|
| File owner | CoE Core + Tech Lead representatives |
| Review cadence | Quarterly |
| Last reviewed | 2025-01 |
| Next review due | 2025-04 |
| Approvers | CoE Lead, Tech Lead representative per stack |
| Change process | PR to ai-engineering-common, 2 CoE approvals required |
