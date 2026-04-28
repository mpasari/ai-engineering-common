# TEST_STRATEGY.md
# SDLC -- QA Stage -- Test Strategy
# Version: 1.0.0
# Status: Active
# Last updated: 2026-04
# Owner: CoE Core
#
# This file is read by:
#   - Test Gen Agent (A15) -- selects correct test type per scenario
#   - Feature Validation Agent (A16) -- AC execution approach
#   - Peer Review Agent (A27) -- checks test coverage

---

## 1. Test pyramid

```
              [E2E]
           (few, slow)
        [Integration tests]
       (some, moderately fast)
    [Unit tests]
  (many, fast)
```

Target ratios:
- Unit:        70% of test count
- Integration: 25% of test count
- E2E:          5% of test count (critical user journeys only)

---

## 2. Unit tests

### 2.1 What to unit test

```
Always unit test:
  -- Domain entities and their business rules
  -- State machine transitions
  -- Domain services with conditional logic
  -- Value object validation
  -- Utility functions with non-trivial logic

Do not unit test:
  -- Simple getters/setters
  -- Repository interfaces (integration test instead)
  -- Spring Boot configuration classes
  -- Main application class
```

### 2.2 Java unit test structure

```java
// Naming: {ClassUnderTest}Test
// Location: src/test/java -- same package as production class
// Framework: JUnit 5 + Mockito + AssertJ

@ExtendWith(MockitoExtension.class)
class OrderTest {

    @Test
    @DisplayName("Order can be cancelled when in PENDING status")
    void cancel_pendingOrder_succeeds() {
        // Given
        var order = OrderTestData.pendingOrder();

        // When
        order.cancel("no longer needed", "user-123");

        // Then
        assertThat(order.status()).isEqualTo(OrderStatus.CANCELLED);
        assertThat(order.cancellationReason()).isEqualTo("no longer needed");
        assertThat(order.domainEvents())
            .hasSize(1)
            .first().isInstanceOf(OrderCancelledEvent.class);
    }

    @Test
    @DisplayName("Order cannot be cancelled when already SHIPPED")
    void cancel_shippedOrder_throwsInvalidStateException() {
        // Given
        var order = OrderTestData.shippedOrder();

        // When / Then
        assertThatThrownBy(() -> order.cancel("reason", "user-123"))
            .isInstanceOf(InvalidOrderStateException.class)
            .hasMessageContaining("SHIPPED");
    }
}
```

Key rules:
- One test = one behaviour being verified
- Given/When/Then structure in comments
- DisplayName annotation on every test -- English, describes behaviour
- Test data via builder pattern (OrderTestData) -- never duplicate setup
- No production database -- pure in-memory

### 2.3 TypeScript unit test structure

```typescript
// Framework: Vitest + Testing Library

describe('OrderCard', () => {
    it('shows the cancel button when order can be cancelled', () => {
        const order = buildOrder({ status: 'PENDING', canBeCancelled: true });
        render(<OrderCard order={order} onCancel={vi.fn()} />);
        expect(screen.getByRole('button', { name: /cancel order/i })).toBeInTheDocument();
    });

    it('hides the cancel button when order cannot be cancelled', () => {
        const order = buildOrder({ status: 'SHIPPED', canBeCancelled: false });
        render(<OrderCard order={order} onCancel={vi.fn()} />);
        expect(screen.queryByRole('button', { name: /cancel order/i })).not.toBeInTheDocument();
    });
});
```

---

## 3. Integration tests

### 3.1 What to integration test

```
Always integration test:
  -- Repository queries against a real database
  -- Kafka producer/consumer pairs
  -- External HTTP client with WireMock
  -- Database migrations (verify schema is correct after migration)
  -- Full request -> response flow (controller through to database)
```

### 3.2 Java integration test structure

```java
// Framework: JUnit 5 + Testcontainers + Spring Boot Test
// Location: src/test/java -- separate package: integration

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
@Tag("integration")
class CancelOrderIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired TestRestTemplate restTemplate;
    @Autowired OrderRepository orderRepository;

    @Test
    void cancelOrder_returnsCancelledOrder() {
        // Given: a pending order exists in the database
        var order = orderRepository.save(OrderTestData.pendingOrder());

        // When: cancellation is requested via the API
        var response = restTemplate.postForEntity(
            "/api/v1/orders/{id}/cancel",
            new CancelOrderRequest("no longer needed"),
            OrderResponse.class,
            order.id());

        // Then: the order is cancelled
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().data().status()).isEqualTo("CANCELLED");

        // And: the database reflects the change
        var saved = orderRepository.findById(order.id()).orElseThrow();
        assertThat(saved.status()).isEqualTo(OrderStatus.CANCELLED);
    }
}
```

---

## 4. Coverage requirements

| Layer | Minimum coverage |
|---|---|
| Domain entities | 80% |
| Application services | 70% |
| Controllers | 60% (via integration tests) |
| Infrastructure (repositories, clients) | 60% (integration tests) |
| Overall service | 60% |

Coverage below threshold triggers gate D05 (Tech Lead approves exception).
Coverage is measured per PR diff (not whole-of-codebase) to avoid
penalising legacy code with no tests.

---

## 5. Test data standards

```
Always use:
  -- Fictional data: user@example.com, +47 999 00 000, "Test User"
  -- Builder pattern: OrderTestData.pendingOrder(), OrderTestData.shippedOrder()
  -- Isolated data: each test creates its own data (no shared state)

Never use:
  -- Real customer names, emails, phone numbers
  -- Production database snapshots
  -- Shared mutable test fixtures across tests
  -- Hardcoded UUIDs (generate per test)
```

---

## 6. Version and review

| File owner | CoE Core |
| Review cadence | Quarterly |
