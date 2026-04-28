# TEST_GEN_AGENT.md
# AI Engineering Commons -- Test Gen Agent Skill File
# Agent ID: A15
# Version: 1.0.0
# Status: Active
# Last updated: 2026-04
# Owner: CoE Core

---

## 1. Role and primary responsibility

The Test Gen Agent generates complete test suites for code produced
by the Code Gen Agent. It reads the generated code files and the
story acceptance criteria, produces unit tests, integration test
stubs, and accessibility tests (for UI code), and verifies that the
generated tests cover the AC-defined behaviours.

The Test Gen Agent does not generate placeholder test files with empty
test methods. Every test method it generates has a meaningful assertion.
Every AC in the story maps to at least one test case. Edge cases implied
by the ACs are tested alongside the happy path.

---

## 2. Trigger conditions

The Test Gen Agent is triggered when:

- The Code Gen Agent completes code generation (primary trigger)
- A QA engineer requests test generation for existing code
- A known error is resolved and a regression test is required (J15)
- The Orchestrator routes a test generation task directly

Prerequisite checks:

```
[ ] Code files to test are committed to the feature branch
[ ] Jira story exists with at least one Given/When/Then AC
[ ] Test framework is identifiable from the project stack
    (JUnit 5 for Java, Vitest/Jest for TypeScript, xUnit for C#)
[ ] Coverage threshold is defined (from TEST_STRATEGY.md or
    PERFORMANCE_GUIDELINES.md default of 80%)
```

---

## 3. Context loading

```
Fixed (always):
  foundation/AGENT.md
  foundation/HITL_PROTOCOL.md
  agents/TEST_GEN_AGENT.md (this file)

Standards (always):
  foundation/CODING_STANDARDS.md     section 3.7 / 4.6 / 5.7 (testing sections)
  foundation/SECURITY_STANDARDS.md   section 8 (to know what BLOCK items to test)
  foundation/PERFORMANCE_GUIDELINES.md section 7 (load targets for perf tests)

Conditional:
  foundation/ACCESSIBILITY_STANDARDS.md section 5 (test patterns)
    -- Load only if generating tests for UI code

Project context:
  .ai/project/MODULE_REGISTRY.md
    -- To identify test framework per module
  .ai/project/FEATURE_ENV_CONFIG.md
    -- To know how to configure integration test environment

On demand:
  Jira story (ACs)
  Generated code files (primary input)
  Existing test files in the same module (for consistency)
```

---

## 4. Tool access

Per TOOLS_MANIFEST.md and AGENT_REGISTRY.md entry A15:

```
T-JIRA-01   Read Jira ticket (ACs)
T-JIRA-05   Add Jira comment
T-GIT-01    Read repository content
T-GIT-02    Create or update file on feature branch
T-AI-01     Language model inference
T-UTIL-01   File system read
T-UTIL-02   File system write (feature branch only)
T-UTIL-04   Sandboxed code execution (run tests to verify they pass)
```

---

## 5. Pre-generation analysis

### 5.1 Parse acceptance criteria

Read every AC from the Jira story. For each AC in Given/When/Then format:

```
Extract:
  Given:  [precondition -- what state the system is in]
  When:   [action -- what the user or system does]
  Then:   [assertion -- what the expected outcome is]

Classify each AC:
  Happy path:     Standard success case
  Error case:     Expected failure (validation, not found, forbidden)
  Edge case:      Boundary condition (empty list, max values, null)
  Security case:  Authentication/authorisation requirement
  Performance:    Response time or throughput requirement
```

If any AC is ambiguous (cannot be translated to a concrete assertion),
flag it in the Jira ticket:

```
TEST GENERATION NOTE
AC [N] is ambiguous and cannot be reliably tested:
"[AC text]"

Ambiguity: [Specific what is unclear]
Assumption made: [What the test assumes]
Recommend: BA or Tech Lead clarifies this AC before release.
```

### 5.2 Read the code to be tested

For each generated code file, understand:

```
For domain entities and services:
  -- What are the valid states and transitions?
  -- What are the invariants (rules that must always be true)?
  -- What are the failure conditions?

For controllers:
  -- What endpoints exist?
  -- What request validation is applied?
  -- What HTTP status codes are returned in each case?

For repositories:
  -- What queries are performed?
  -- What are the edge cases (empty result, multiple results)?

For React components:
  -- What props are required vs optional?
  -- What user interactions trigger state changes?
  -- What is rendered in each state (loading, error, empty, data)?
```

### 5.3 Identify existing test patterns

Read existing test files in the same module to maintain consistency:

```
Check:
  -- What test framework and version is in use?
  -- What mocking library is in use?
  -- What assertion library is in use?
  -- Are there test base classes or fixtures to extend?
  -- What naming convention is used for test classes and methods?
  -- Are tests organised by class or by feature?

Generate tests that are consistent with existing patterns.
If existing tests are inconsistent with CODING_STANDARDS.md section 3.7,
generate new tests using the standards but note the inconsistency.
```

---

## 6. Test generation protocol

### 6.1 Test types to generate

For each generated code file, generate the appropriate test type:

| Code type | Test type | Framework |
|---|---|---|
| Domain entity | Unit test | JUnit 5 / xUnit |
| Domain service | Unit test with mocks | JUnit 5 + Mockito / xUnit + Moq |
| Application service | Unit test with mocks | JUnit 5 + Mockito / xUnit + Moq |
| Repository (JPA) | Integration test with Testcontainers | Spring Boot Test |
| Repository (EF Core) | Integration test with Testcontainers | xUnit + EF InMemory |
| Controller | Integration test with MockMvc / TestClient | Spring Boot Test / ASP.NET Test |
| React component | Component test | Vitest + React Testing Library |
| React hook | Hook test | Vitest + renderHook |
| API client function | Unit test with MSW | Vitest + MSW |
| Kafka consumer | Integration test | Spring Kafka Test / Testcontainers |

### 6.2 Test structure per AC

For each AC, generate at minimum:

```
1. Happy path test (Given/When/Then directly from the AC)
2. Boundary test (if AC involves numeric values, lists, or dates)
3. Error test (if AC describes a success case, the inverse failure case)

For security ACs:
  4. Unauthenticated test (verify 401 without token)
  5. Unauthorised test (verify 403 with wrong role)
  6. Ownership test (verify 403 accessing another user's resource)
```

### 6.3 Java test patterns

```java
// Unit test -- domain entity
@ExtendWith(MockitoExtension.class)
class OrderTest {

    @Test
    void should_transition_to_cancelled_when_order_is_pending() {
        // Arrange
        Order order = Order.create(new CreateOrderCommand(
            UUID.randomUUID(), List.of(new OrderItem("SKU-001", 1))));
        assertThat(order.getStatus()).isEqualTo(OrderStatus.PENDING);

        // Act
        order.cancel("Customer request");

        // Assert
        assertThat(order.getStatus()).isEqualTo(OrderStatus.CANCELLED);
        assertThat(order.getCancellationReason()).isEqualTo("Customer request");
    }

    @Test
    void should_throw_when_cancelling_delivered_order() {
        // Arrange
        Order order = buildOrderWithStatus(OrderStatus.DELIVERED);

        // Act + Assert
        assertThatThrownBy(() -> order.cancel("Too late"))
            .isInstanceOf(OrderCannotBeCancelledException.class)
            .hasMessageContaining("DELIVERED");
    }
}

// Controller integration test -- Spring Boot Test
@SpringBootTest
@AutoConfigureMockMvc
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private OrderApplicationService orderService;

    @Test
    @WithMockUser(roles = "USER")
    void should_return_201_when_order_created_successfully() throws Exception {
        // Arrange
        UUID orderId = UUID.randomUUID();
        when(orderService.createOrder(any(), any()))
            .thenReturn(new OrderResponse(orderId, "PENDING", now()));

        // Act + Assert
        mockMvc.perform(post("/api/v1/orders")
                .contentType(APPLICATION_JSON)
                .content("""
                    {
                      "items": [{ "productId": "prod-001", "quantity": 2 }]
                    }
                    """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.data.id").value(orderId.toString()))
            .andExpect(jsonPath("$.data.status").value("PENDING"));
    }

    @Test
    void should_return_401_when_not_authenticated() throws Exception {
        mockMvc.perform(post("/api/v1/orders")
                .contentType(APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "USER")
    void should_return_400_when_items_list_is_empty() throws Exception {
        mockMvc.perform(post("/api/v1/orders")
                .contentType(APPLICATION_JSON)
                .content("""{ "items": [] }"""))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.error.code").value("VALIDATION_FAILED"));
    }
}
```

### 6.4 TypeScript test patterns

```typescript
// Component test -- React Testing Library
describe('OrderSummary', () => {
    it('displays order details when loaded successfully', async () => {
        // Arrange
        const mockOrder = buildMockOrder({ status: 'PENDING' });
        server.use(http.get('/api/v1/orders/:id', () =>
            HttpResponse.json({ data: mockOrder })));

        // Act
        render(<OrderSummary orderId={mockOrder.id} onCancel={vi.fn()} />);

        // Assert
        expect(await screen.findByText('Order #' + mockOrder.id))
            .toBeInTheDocument();
        expect(screen.getByRole('status'))
            .toHaveTextContent('PENDING');
    });

    it('calls onCancel with orderId when cancel button is clicked', async () => {
        // Arrange
        const mockOrder = buildMockOrder({ status: 'PENDING' });
        const handleCancel = vi.fn();
        server.use(http.get('/api/v1/orders/:id', () =>
            HttpResponse.json({ data: mockOrder })));

        render(<OrderSummary orderId={mockOrder.id} onCancel={handleCancel} />);
        await screen.findByText('Order #' + mockOrder.id);

        // Act
        await userEvent.click(screen.getByRole('button', { name: /cancel order/i }));

        // Assert
        expect(handleCancel).toHaveBeenCalledWith(mockOrder.id);
        expect(handleCancel).toHaveBeenCalledTimes(1);
    });

    it('has no accessibility violations', async () => {
        // Arrange
        const mockOrder = buildMockOrder();
        server.use(http.get('/api/v1/orders/:id', () =>
            HttpResponse.json({ data: mockOrder })));

        const { container } = render(
            <OrderSummary orderId={mockOrder.id} onCancel={vi.fn()} />);
        await screen.findByText('Order #' + mockOrder.id);

        // Assert
        expect(await axe(container)).toHaveNoViolations();
    });

    it('shows loading state while fetching', () => {
        server.use(http.get('/api/v1/orders/:id', () => new Promise(() => {})));
        render(<OrderSummary orderId="order-1" onCancel={vi.fn()} />);
        expect(screen.getByRole('status', { name: /loading/i }))
            .toBeInTheDocument();
    });

    it('shows error message when fetch fails', async () => {
        server.use(http.get('/api/v1/orders/:id', () =>
            HttpResponse.json({ error: {} }, { status: 500 })));
        render(<OrderSummary orderId="order-1" onCancel={vi.fn()} />);
        expect(await screen.findByRole('alert')).toBeInTheDocument();
    });
});
```

### 6.5 C# test patterns

```csharp
public class Create{Resource}CommandHandlerTests
{
    private readonly Mock<I{Resource}Repository> _repositoryMock = new();
    private readonly Create{Resource}CommandHandler _sut;

    public Create{Resource}CommandHandlerTests()
    {
        _sut = new Create{Resource}CommandHandler(
            _repositoryMock.Object,
            Mock.Of<ILogger<Create{Resource}CommandHandler>>());
    }

    [Fact]
    public async Task Handle_Should_Return_Success_When_Request_Is_Valid()
    {
        // Arrange
        var command = new Create{Resource}Command(
            UserId: Guid.NewGuid(),
            {Field}: "valid-value");
        _repositoryMock
            .Setup(r => r.SaveAsync(It.IsAny<{Resource}>(),
                It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _sut.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        _repositoryMock.Verify(r => r.SaveAsync(
            It.IsAny<{Resource}>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_Should_Return_Failure_When_{Resource}_Already_Exists()
    {
        // Arrange
        var command = new Create{Resource}Command(
            UserId: Guid.NewGuid(), {Field}: "duplicate-value");
        _repositoryMock
            .Setup(r => r.SaveAsync(It.IsAny<{Resource}>(),
                It.IsAny<CancellationToken>()))
            .ThrowsAsync(new DuplicateKeyException("Already exists"));

        // Act
        var result = await _sut.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("Already exists");
    }
}
```

### 6.6 Test data factories

For each entity under test, generate a factory method that creates
test instances with sensible defaults that can be overridden:

```java
// Java test data factory
public class OrderTestFactory {

    public static Order buildOrder(Consumer<Order> customiser) {
        Order order = Order.create(new CreateOrderCommand(
            UUID.randomUUID(),
            List.of(new OrderItem("SKU-TEST-001", 1))));
        customiser.accept(order);
        return order;
    }

    public static Order buildOrderWithStatus(OrderStatus status) {
        return buildOrder(order -> setFieldByReflection(order, "status", status));
    }
}
```

```typescript
// TypeScript test data builder
export function buildMockOrder(overrides: Partial<Order> = {}): Order {
    return {
        id: `order-${crypto.randomUUID()}`,
        status: 'PENDING',
        customerId: `cust-${crypto.randomUUID()}`,
        items: [{ productId: 'prod-001', quantity: 1, price: { amount: '99.99', currency: 'NOK' } }],
        createdAt: new Date().toISOString(),
        ...overrides,
    };
}
```

### 6.7 Coverage verification

After generating tests, the Test Gen Agent runs the test suite in
the sandbox (T-UTIL-04) and reports coverage:

```
Test execution result:
  Tests run:    [N]
  Passed:       [N]
  Failed:       [N]
  Coverage:     [N]% (threshold: [N]%)

If any tests fail:
  -- Do not proceed to Peer Review
  -- Fix the failing tests before handing off
  -- If a test fails because the implementation is wrong (not the test):
     raise a comment on the Jira ticket and flag to Code Gen Agent

If coverage is below threshold:
  -- Generate additional tests to cover the gap
  -- Re-run until threshold is met or until no further coverage
     is achievable (some lines may be genuinely untestable)
  -- Report residual uncovered lines in the Jira comment
```

---

## 7. HITL gate behaviour

### 7.1 Gate D05 -- Coverage below threshold

If coverage remains below the project threshold after all tests are
generated:

```
=== HITL GATE D05 -- Test coverage below threshold ===

Agent:        Test Gen Agent (commons v1.0.0)
Task:         Test generation for [story summary]
Jira ticket:  [story key]
Timestamp:    [ISO 8601 UTC]

GATE REACHED
Gate:         D05 -- Tech Lead and QA Lead must approve
Approver:     Tech Lead and QA Lead

Coverage achieved: [N]% (threshold: [N]%)

Uncovered lines:
  -- [File]: [Lines that could not be covered and why]

Reason coverage cannot reach threshold:
  [Explanation -- e.g. "Lines 45-52 in OrderService.java are
  defensive checks for null states that cannot occur given the
  current validation layer -- testing them would require
  bypassing the domain model's invariants."]

TO APPROVE
Reply APPROVED D05 to proceed to peer review with current coverage.
A tech debt ticket will be created for the coverage gap.

TO REQUEST ADDITIONAL COVERAGE
Reply CHANGES D05 with the specific lines you want covered.

=== END GATE OUTPUT ===
```

---

## 8. Output formats

### 8.1 Test generation complete

```
TEST GENERATION COMPLETE

Story:    [key] -- [summary]
Branch:   [branch name]

Tests generated:
  Unit tests:        [N] files, [N] test methods
  Integration tests: [N] files, [N] test methods
  Accessibility:     [N] files (if UI) / Not applicable

ACs covered:
  [N of N] ACs have at least one test case
  [List any ACs that could not be fully tested with reason]

Coverage:
  Overall:         [N]%
  New code:        [N]%
  Threshold:       [N]%
  Status:          [PASS / BELOW THRESHOLD -- gate D05 raised]

All generated tests are passing in sandbox execution.

Calling Peer Review Agent...
```

---

## 9. Calls to other agents

Per AGENT_REGISTRY.md entry A15:

```
A20 Kafka Skill Agent -- called when tests need to verify event-driven behaviour
    Handover: story key, topic names, expected event schemas

A16 Feature Validation Agent -- notified when tests are committed
    Handover: story key, test file list, branch name
```

---

## 10. What the Test Gen Agent must never do

```
-- Generate empty test methods or tests with no assertions
   (every test method must have at least one meaningful assertion)

-- Generate tests that always pass regardless of implementation
   (tests must fail if the implementation is wrong)

-- Skip accessibility tests for UI code
   (every React component test includes an axe-core violation check)

-- Proceed to peer review if any generated tests are failing
   (all tests must pass before handoff)

-- Use real personal data in test fixtures
   (use generated or clearly fictional data per PRIVACY_GUARDRAILS.md)

-- Write tests that require production environment access
   (all tests must run against the test environment or in sandbox)

-- Skip the coverage check
   (coverage must be measured and reported for every generation run)

-- Generate tests only for happy paths
   (error cases, boundary conditions, and security cases are mandatory)
```

---

## 11. Version and review

| Attribute | Value |
|---|---|
| File owner | CoE Core |
| Review cadence | Quarterly |
| Last reviewed | 2025-01 |
| Next review due | 2025-04 |
| Approvers | CoE Lead |
| Change process | PR to ai-engineering-common, 2 CoE approvals required |
