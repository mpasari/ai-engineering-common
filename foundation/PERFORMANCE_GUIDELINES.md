# 5PERFORMANCE_GUIDELINES.md

# AI Engineering Commons -- Performance Guidelines for All Code Generation

# Version: 1.0.0

# Status: Active

# Last updated: 2026-04

# Owner: CoE Core + Tech Lead representatives

---

## 1. Purpose

This file defines the performance requirements and patterns that all agents
must apply when generating, reviewing, or modifying code. It covers database
access, caching, async patterns, pagination, and load targets.

Referenced by:

- `agents/CODE_GEN_AGENT.md` -- applies these patterns during generation
- `agents/PERFORMANCE_AGENT.md` -- uses these as the baseline for analysis
- `agents/PEER_REVIEW_AGENT.md` -- checks every PR against these guidelines
- `agents/TEST_GEN_AGENT.md` -- uses load targets to generate performance tests
- `sdlc/spec/NON_FUNCTIONAL_REQUIREMENTS.md` -- references these targets

When the Performance Agent detects a violation during a PR review or a
production incident investigation, it references the specific section and
rule number from this file in its output.

---

## 2. Database access rules

These are the most common source of performance issues in Telia services.
The Peer Review Agent checks every PR for these patterns.

### 2.1 N+1 query prevention

The N+1 problem occurs when code executes one query to fetch a list and
then one additional query per item in that list.

```java
// FORBIDDEN -- N+1 query pattern
List<Order> orders = orderRepository.findAll();
for (Order order : orders) {
    // This executes a separate query for every order
    List<OrderItem> items = itemRepository.findByOrderId(order.getId());
    order.setItems(items);
}

// REQUIRED -- fetch with JOIN or batch loading
List<Order> orders = orderRepository.findAllWithItems(); // single JOIN query

// In JPA -- use JOIN FETCH
@Query("SELECT o FROM Order o JOIN FETCH o.items WHERE o.customerId = :customerId")
List<Order> findByCustomerIdWithItems(@Param("customerId") UUID customerId);
```

```typescript
// FORBIDDEN -- N+1 in TypeScript/ORM
const orders = await orderRepository.find();
for (const order of orders) {
    order.items = await itemRepository.findBy({ orderId: order.id }); // N queries
}

// REQUIRED -- eager load with relations
const orders = await orderRepository.find({
    relations: ['items', 'customer'],
    where: { customerId }
});
```

### 2.2 Query complexity limits


| Rule                                     | Limit     | Action when exceeded                        |
| ---------------------------------------- | --------- | ------------------------------------------- |
| Maximum JOINs per query                  | 4         | Refactor to separate queries or denormalise |
| Maximum rows fetched without pagination  | 100       | Add pagination -- see section 5             |
| Maximum query execution time (OLTP)      | 100ms p95 | Investigate index, query plan               |
| Maximum query execution time (reporting) | 5s p95    | Move to async/batch processing              |
| Maximum subquery depth                   | 2         | Refactor to CTEs or temporary tables        |


### 2.3 Index requirements

Agents must generate indexes alongside any query that filters or sorts
by a non-primary-key column. The following patterns always require an index:

```sql
-- Any WHERE clause on a non-PK column needs an index
-- Agents generate the migration alongside the query

-- Example: filtering orders by customer and status
CREATE INDEX idx_orders_customer_status
    ON orders (customer_id, status)
    WHERE status != 'COMPLETED'; -- partial index for active orders only

-- Example: sorting by created_at for pagination
CREATE INDEX idx_orders_created_at ON orders (created_at DESC);

-- Example: foreign key columns always need an index
CREATE INDEX idx_order_items_order_id ON order_items (order_id);
```

The Data Migration Agent generates index migration scripts alongside
any new query that would benefit from one.

### 2.4 Connection pool rules

```java
// Required connection pool configuration -- HikariCP
@Bean
public HikariDataSource dataSource() {
    HikariConfig config = new HikariConfig();
    config.setMaximumPoolSize(20);          // max connections per instance
    config.setMinimumIdle(5);               // keep 5 warm connections
    config.setConnectionTimeout(3000);      // fail fast -- 3 second timeout
    config.setIdleTimeout(600000);          // release idle after 10 minutes
    config.setMaxLifetime(1800000);         // recycle connections after 30 minutes
    config.setLeakDetectionThreshold(5000); // warn if connection held > 5 seconds
    return new HikariDataSource(config);
}
```

Agents must not generate code that:

- Holds a database connection open across an external HTTP call
- Opens a connection inside a loop
- Uses a new connection per request without pooling
- Disables connection pool validation queries

---

## 3. Caching rules

### 3.1 What to cache


| Data type                                                 | Cache strategy            | TTL              |
| --------------------------------------------------------- | ------------------------- | ---------------- |
| Reference data (countries, currencies, product catalogue) | In-memory + Redis         | 1 hour           |
| User session data                                         | Redis                     | Session duration |
| API responses from slow third-party services              | Redis                     | Per partner SLA  |
| Computed aggregates (counts, totals)                      | Redis                     | 5 minutes        |
| Per-request repeated lookups                              | In-memory (request scope) | Request lifetime |
| User-specific personalised data                           | Redis with user key       | 15 minutes       |
| Security tokens and permissions                           | Redis                     | Token expiry     |


### 3.2 What must NOT be cached

- Data that must be real-time accurate for financial or legal reasons
- Data subject to GDPR erasure (caching may outlive a deletion request)
- Credentials, secrets, or tokens in application-level cache
- Large binary objects (use CDN or object storage instead)
- Data from a multi-tenant system without tenant isolation in the cache key

### 3.3 Cache key design

```java
// Cache keys must be deterministic and include all relevant dimensions
// FORBIDDEN -- ambiguous key
cache.put("user", userProfile);

// REQUIRED -- fully qualified key
String cacheKey = String.format("user:profile:v1:%s", userId);
cache.put(cacheKey, userProfile, Duration.ofMinutes(15));

// For multi-tenant systems -- always include tenant identifier
String cacheKey = String.format("tenant:%s:user:profile:v1:%s", tenantId, userId);
```

### 3.4 Cache-aside pattern

```java
// Standard cache-aside pattern agents must use
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository repository;
    private final RedisTemplate<String, Product> cache;

    private static final Duration TTL = Duration.ofHours(1);

    public Product findById(UUID productId) {
        String key = "product:v1:" + productId;

        // 1. Check cache
        Product cached = cache.opsForValue().get(key);
        if (cached != null) return cached;

        // 2. Load from database
        Product product = repository.findById(productId)
            .orElseThrow(() -> new ProductNotFoundException(productId));

        // 3. Populate cache
        cache.opsForValue().set(key, product, TTL);
        return product;
    }

    public void update(Product product) {
        repository.save(product);
        // 4. Invalidate cache on write -- never update cache directly
        cache.delete("product:v1:" + product.getId());
    }
}
```

### 3.5 Cache invalidation rules

- Always invalidate on write -- never update the cached value directly
- Use versioned cache keys (`v1`, `v2`) when the cached data structure changes
- Implement cache warming for critical reference data on service startup
- Never use cache as the primary store -- always have a database fallback

---

## 4. Async and non-blocking patterns

### 4.1 When to use async processing


| Scenario                          | Pattern                          | Reason                              |
| --------------------------------- | -------------------------------- | ----------------------------------- |
| Email / SMS sending               | Kafka event or async task        | User should not wait for delivery   |
| PDF generation                    | Kafka event + polling or webhook | Generation can take seconds         |
| Report generation                 | Async job + status endpoint      | Can take minutes                    |
| Third-party API calls > 500ms SLA | Circuit breaker + fallback       | Protect response time               |
| Batch data processing             | Scheduled job + Kafka            | Never in a request thread           |
| Search index updates              | Kafka event                      | Eventually consistent is acceptable |
| Audit log writing                 | Async, best-effort               | Must not block main flow            |


### 4.2 CompletableFuture patterns (Java)

```java
// REQUIRED pattern for parallel independent operations
public OrderSummary buildOrderSummary(UUID orderId) {
    // These two calls are independent -- run them in parallel
    CompletableFuture<Order> orderFuture =
        CompletableFuture.supplyAsync(() -> orderRepository.findById(orderId)
            .orElseThrow(), executor);

    CompletableFuture<List<Payment>> paymentsFuture =
        CompletableFuture.supplyAsync(() -> paymentRepository.findByOrderId(orderId),
            executor);

    return CompletableFuture.allOf(orderFuture, paymentsFuture)
        .thenApply(v -> new OrderSummary(
            orderFuture.join(),
            paymentsFuture.join()
        ))
        .orTimeout(5, TimeUnit.SECONDS) // always set a timeout
        .join();
}
```

### 4.3 Virtual threads (Java 21+)

```java
// Prefer virtual threads for I/O-bound work over thread pool tuning
// In Spring Boot 3.2+ -- enable in application.yml
// spring.threads.virtual.enabled: true

// This makes all @Async and servlet request handling use virtual threads
// No code changes required -- configure at the framework level
```

### 4.4 Async patterns in TypeScript

```typescript
// REQUIRED -- parallel independent calls with Promise.all
async function buildOrderSummary(orderId: string): Promise<OrderSummary> {
    // Run independent calls in parallel -- not sequential await
    const [order, payments, shipment] = await Promise.all([
        orderRepository.findById(orderId),
        paymentRepository.findByOrderId(orderId),
        shipmentRepository.findByOrderId(orderId),
    ]);

    return { order, payments, shipment };
}

// FORBIDDEN -- sequential awaits for independent operations
async function buildOrderSummary(orderId: string): Promise<OrderSummary> {
    const order    = await orderRepository.findById(orderId);    // waits
    const payments = await paymentRepository.findByOrderId(orderId); // then waits
    const shipment = await shipmentRepository.findByOrderId(orderId); // then waits
    return { order, payments, shipment };
}
```

### 4.5 Timeout requirements

Every external call must have an explicit timeout. Agents must generate
timeouts alongside any HTTP client, database query, or cache operation.


| Operation type             | Default timeout | Maximum allowed |
| -------------------------- | --------------- | --------------- |
| Internal service HTTP call | 2 seconds       | 5 seconds       |
| External partner API call  | 5 seconds       | 30 seconds      |
| Database query (OLTP)      | 3 seconds       | 10 seconds      |
| Cache read                 | 100ms           | 500ms           |
| Kafka producer send        | 1 second        | 5 seconds       |
| File system read           | 1 second        | 10 seconds      |


```java
// REQUIRED -- explicit timeout on every external call
RestClient restClient = RestClient.builder()
    .requestFactory(new HttpComponentsClientHttpRequestFactory(
        HttpClients.custom()
            .setConnectionRequestTimeout(Timeout.ofSeconds(1))
            .setResponseTimeout(Timeout.ofSeconds(2))
            .build()
    ))
    .build();
```

---

## 5. Pagination rules

### 5.1 All list endpoints must be paginated

No endpoint may return an unbounded list of results. Agents must generate
pagination for every endpoint or query that returns a collection.

```java
// REQUIRED -- paginated endpoint
@GetMapping("/orders")
public Page<OrderSummary> getOrders(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(defaultValue = "createdAt") String sortBy,
        @RequestParam(defaultValue = "DESC") Sort.Direction direction,
        @AuthenticationPrincipal User currentUser) {

    if (size > 100) size = 100; // enforce maximum page size
    Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
    return orderRepository.findByCustomerId(currentUser.getId(), pageable)
        .map(OrderSummary::from);
}
```

### 5.2 Cursor-based pagination for large datasets

For datasets larger than 10,000 rows or where offset pagination causes
performance issues, use cursor-based pagination:

```java
// Cursor-based pagination -- more efficient for large datasets
@GetMapping("/events")
public CursorPage<EventSummary> getEvents(
        @RequestParam(required = false) String cursor,
        @RequestParam(defaultValue = "20") int limit) {

    UUID afterId = cursor != null ? UUID.fromString(cursor) : null;
    List<Event> events = eventRepository.findAfterCursor(afterId, limit + 1);

    boolean hasMore = events.size() > limit;
    List<Event> page = hasMore ? events.subList(0, limit) : events;
    String nextCursor = hasMore ? page.get(page.size() - 1).getId().toString() : null;

    return new CursorPage<>(page.stream().map(EventSummary::from).toList(),
                            nextCursor, hasMore);
}
```

### 5.3 Pagination defaults


| Setting                           | Default          | Maximum |
| --------------------------------- | ---------------- | ------- |
| Default page size                 | 20               | 100     |
| Maximum page size                 | 100              | --      |
| Default sort                      | `createdAt DESC` | --      |
| Cursor expiry (cursor pagination) | 24 hours         | --      |


---

## 6. Memory management rules

### 6.1 Stream large datasets

```java
// FORBIDDEN -- loading entire large dataset into memory
List<Order> allOrders = orderRepository.findAll(); // could be millions of rows
allOrders.forEach(this::processOrder);

// REQUIRED -- stream processing for large datasets
try (Stream<Order> orderStream = orderRepository.streamAll()) {
    orderStream
        .filter(order -> order.getStatus() == OrderStatus.PENDING)
        .forEach(this::processOrder);
}
```

### 6.2 Object pooling for expensive resources

```java
// Agents must not instantiate these objects inside loops or per-request
// These are expensive to create and must be shared:
// - ObjectMapper (Jackson)
// - RestTemplate / RestClient
// - HttpClient
// - DateTimeFormatter
// - Pattern (compiled regex)

// REQUIRED -- singleton beans or static final constants
@Configuration
public class SharedBeansConfig {

    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }
}

// Static final for compiled patterns
private static final Pattern EMAIL_PATTERN =
    Pattern.compile("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$");
```

### 6.3 Response size limits


| Response type          | Maximum size | Action if exceeded                   |
| ---------------------- | ------------ | ------------------------------------ |
| REST API JSON response | 10MB         | Paginate or use streaming            |
| File download via API  | 50MB         | Use pre-signed URL to object storage |
| Kafka message payload  | 1MB          | Split or reference external storage  |
| WebSocket message      | 64KB         | Chunk the message                    |


---

## 7. Load targets and SLO baselines

These are the baseline performance targets for all Telia services. Individual
services may define stricter targets in their `SRE_SERVICE_CONFIG.md`.

### 7.1 Response time targets (OLTP services)


| Percentile   | Target   | Alert threshold |
| ------------ | -------- | --------------- |
| p50 (median) | < 50ms   | > 100ms         |
| p95          | < 200ms  | > 500ms         |
| p99          | < 500ms  | > 1000ms        |
| p999         | < 2000ms | > 5000ms        |


### 7.2 Availability targets


| Service tier                 | Availability target | Max downtime per month |
| ---------------------------- | ------------------- | ---------------------- |
| Critical (billing, auth)     | 99.95%              | 22 minutes             |
| Standard (most services)     | 99.9%               | 44 minutes             |
| Best-effort (internal tools) | 99.5%               | 3.6 hours              |


### 7.3 Throughput baselines


| Service type        | Baseline RPS                      | Scale trigger                    |
| ------------------- | --------------------------------- | -------------------------------- |
| Customer-facing API | 1,000 RPS per instance            | > 70% CPU or > 80% memory        |
| Internal service    | 500 RPS per instance              | > 70% CPU or > 80% memory        |
| Kafka consumer      | 10,000 messages/sec per partition | Consumer lag > 10,000 messages   |
| Batch job           | N/A                               | Duration > 2x historical average |


### 7.4 Error rate targets


| Error type                 | Target              | Alert threshold |
| -------------------------- | ------------------- | --------------- |
| 5xx errors                 | < 0.1% of requests  | > 0.5%          |
| 4xx errors (client errors) | < 5% of requests    | > 10%           |
| Kafka consumer failures    | < 0.01%             | > 0.1%          |
| DLQ messages               | 0 per hour (normal) | > 10 per hour   |


---

## 8. Performance review checklist for agents

The Performance Agent and Peer Review Agent check every PR against this list.


| #   | Check                                                           | Severity |
| --- | --------------------------------------------------------------- | -------- |
| P01 | No N+1 query patterns                                           | BLOCK    |
| P02 | No unbounded list queries without pagination                    | BLOCK    |
| P03 | No database calls inside loops                                  | BLOCK    |
| P04 | No synchronous calls to slow operations in request thread       | BLOCK    |
| P05 | External HTTP calls have explicit timeouts                      | BLOCK    |
| P06 | No ObjectMapper/HttpClient instantiated per request             | WARN     |
| P07 | New query columns have indexes generated                        | WARN     |
| P08 | Parallel independent calls use Promise.all or CompletableFuture | WARN     |
| P09 | Large dataset processing uses streaming not in-memory load      | WARN     |
| P10 | Cache keys include all relevant dimensions                      | WARN     |
| P11 | Cache invalidation on write is implemented                      | WARN     |
| P12 | Connection pool is configured with timeout and max size         | WARN     |
| P13 | Response size is within defined limits                          | WARN     |
| P14 | Paginated endpoints enforce maximum page size                   | WARN     |
| P15 | No compiled regex or patterns created inside loops              | INFO     |


---

## 9. What agents do when they detect a violation

When a BLOCK item is detected during code generation or review:

```
PERFORMANCE BLOCK -- [Agent Name]

Rule violated: [P0X] -- [Rule name from section 8]
Location: [File and line number or function name]

Issue:
[One sentence description of the performance problem]

Risk:
[What happens at scale -- e.g. "This will cause N database queries
per request, where N is the number of orders returned"]

Required fix:
[Corrected code pattern with example]
```

For WARN items, the agent adds a comment to the PR review but does not
block generation or merge. The Tech Lead reviewer decides whether to
address immediately or create a follow-up Jira ticket.

---

## 10. Relationship to other files


| File                                | Relationship                                                    |
| ----------------------------------- | --------------------------------------------------------------- |
| `SECURITY_STANDARDS.md`             | Security rules complement these performance rules -- both apply |
| `agents/PERFORMANCE_AGENT.md`       | The agent that enforces this file during incident analysis      |
| `agents/PEER_REVIEW_AGENT.md`       | Checks the P01-P15 checklist on every PR                        |
| `sdlc/ops/SLA_DEFINITIONS.md`       | Per-service SLO targets that override section 7 defaults        |
| `sdlc/qa/PERFORMANCE_TEST_GUIDE.md` | How to write performance tests against these targets            |
| `agents/TEST_GEN_AGENT.md`          | Uses section 7 targets to generate performance test assertions  |


---

## 11. Version and review


| Attribute       | Value                                                 |
| --------------- | ----------------------------------------------------- |
| File owner      | CoE Core + Tech Lead representatives                  |
| Review cadence  | Quarterly                                             |
| Last reviewed   | 2026-04                                               |
| Next review due | 2026-05                                               |
| Approvers       | CoE Lead, Tech Lead representative, SRE Lead          |
| Change process  | PR to ai-engineering-common, 2 CoE approvals required |


