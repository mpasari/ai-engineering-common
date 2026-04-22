# API_DESIGN_STANDARDS.md
# AI Engineering Commons -- API Design Standards for All Code Generation
# Version: 1.0.0
# Status: Active
# Last updated: 2025-01
# Owner: CoE Core + Architect representatives

---

## 1. Purpose

This file defines the API design conventions that all agents must follow
when generating, reviewing, or modifying REST APIs, GraphQL schemas, and
event contracts. Consistent API design reduces integration friction across
teams, makes APIs predictable for consumers, and enables automated
contract testing.

Referenced by:
- `agents/SPEC_WRITER_AGENT.md` -- generates API contracts from requirements
- `agents/CODE_GEN_AGENT.md` -- generates controllers, clients, and DTOs
- `agents/PEER_REVIEW_AGENT.md` -- checks every API PR against these standards
- `agents/EVENT_SCHEMA_AGENT.md` -- applies these for event contract design
- `sdlc/spec/TECHNICAL_SPEC_TEMPLATE.md` -- API section follows this file

When a team diverges from any standard here, the deviation and reason
must be documented in the API spec and approved by the Architect.

---

## 2. REST API fundamentals

### 2.1 Resource naming

| Rule | Correct | Incorrect |
|---|---|---|
| Resources are nouns, not verbs | `/orders` | `/getOrders`, `/createOrder` |
| Collections are plural | `/orders`, `/customers` | `/order`, `/customer` |
| Use hyphens for multi-word resources | `/payment-methods` | `/paymentMethods`, `/payment_methods` |
| Lowercase only | `/order-items` | `/OrderItems` |
| Nested resources show ownership | `/orders/{orderId}/items` | `/order-items?orderId=xxx` |
| Maximum nesting depth of 2 | `/orders/{id}/items` | `/customers/{id}/orders/{id}/items/{id}` |

```
# Correct resource paths
GET    /api/v1/orders                    -- list orders
POST   /api/v1/orders                    -- create order
GET    /api/v1/orders/{orderId}          -- get single order
PUT    /api/v1/orders/{orderId}          -- replace order (full update)
PATCH  /api/v1/orders/{orderId}          -- partial update
DELETE /api/v1/orders/{orderId}          -- delete order
GET    /api/v1/orders/{orderId}/items    -- list items for an order
POST   /api/v1/orders/{orderId}/cancel   -- action on a resource (exception to noun rule)
```

### 2.2 HTTP methods

| Method | Use | Body | Idempotent | Safe |
|---|---|---|---|---|
| GET | Retrieve resource(s) | None | Yes | Yes |
| POST | Create resource or trigger action | Yes | No | No |
| PUT | Replace resource entirely | Yes | Yes | No |
| PATCH | Partial update | Yes | No | No |
| DELETE | Remove resource | Optional | Yes | No |
| HEAD | Check resource existence | None | Yes | Yes |
| OPTIONS | CORS preflight | None | Yes | Yes |

Agents must not use:
- GET with a request body
- POST for idempotent operations that should be PUT
- DELETE with a required request body
- Custom HTTP methods

### 2.3 HTTP status codes

Agents must use these status codes consistently. Using the wrong code
is flagged as a WARN by the Peer Review Agent.

**2xx Success:**

| Code | When to use |
|---|---|
| 200 OK | Successful GET, PUT, PATCH, DELETE with body |
| 201 Created | Successful POST that creates a resource |
| 202 Accepted | Request accepted for async processing |
| 204 No Content | Successful DELETE or action with no response body |

**4xx Client errors:**

| Code | When to use |
|---|---|
| 400 Bad Request | Malformed request, validation failure |
| 401 Unauthorized | Not authenticated (missing or invalid token) |
| 403 Forbidden | Authenticated but not authorised |
| 404 Not Found | Resource does not exist |
| 405 Method Not Allowed | HTTP method not supported on this endpoint |
| 409 Conflict | Resource conflict (duplicate, optimistic lock failure) |
| 410 Gone | Resource existed but was permanently deleted |
| 422 Unprocessable Entity | Semantically invalid request (business rule violation) |
| 429 Too Many Requests | Rate limit exceeded |

**5xx Server errors:**

| Code | When to use |
|---|---|
| 500 Internal Server Error | Unexpected server error |
| 502 Bad Gateway | Upstream service returned invalid response |
| 503 Service Unavailable | Service temporarily unavailable |
| 504 Gateway Timeout | Upstream service timed out |

---

## 3. API versioning

### 3.1 Versioning strategy

All Telia APIs use URL path versioning. The version is part of the path,
not a header or query parameter.

```
# Correct -- version in path
https://api.telia.com/api/v1/orders
https://api.telia.com/api/v2/orders

# Forbidden -- version in header
Accept: application/vnd.telia.v1+json

# Forbidden -- version in query parameter
https://api.telia.com/api/orders?version=1
```

### 3.2 Version lifecycle

| Stage | Meaning | SLA |
|---|---|---|
| Current | Latest stable version | Full support |
| Supported | Previous version still maintained | Bug fixes only |
| Deprecated | Announced for removal | Minimum 6 months notice |
| Retired | No longer available | -- |

When an API version is deprecated, agents must generate a
`Deprecation` header in all responses from that version:

```java
// Required deprecation header on deprecated API versions
response.addHeader("Deprecation", "Mon, 01 Jun 2025 00:00:00 GMT");
response.addHeader("Sunset", "Mon, 01 Dec 2025 00:00:00 GMT");
response.addHeader("Link", "</api/v2/orders>; rel=\"successor-version\"");
```

### 3.3 Breaking vs non-breaking changes

Agents must classify all API changes before generating them.

**Non-breaking changes -- no version bump required:**
- Adding a new optional field to a response
- Adding a new optional query parameter
- Adding a new endpoint
- Adding a new HTTP method to an existing path
- Relaxing validation (making a required field optional)

**Breaking changes -- require a new version:**
- Removing a field from a response
- Renaming a field
- Changing a field's data type
- Making an optional field required
- Changing the meaning of a status code
- Removing an endpoint
- Changing authentication requirements

---

## 4. Request and response format

### 4.1 Standard response envelope

All API responses use a consistent structure. Agents must generate
response classes that follow this pattern.

**Success response (single resource):**
```json
{
  "data": {
    "id": "ord-8821",
    "status": "PENDING",
    "customerId": "cust-1234",
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
```

**Success response (collection):**
```json
{
  "data": [
    { "id": "ord-8821", "status": "PENDING" },
    { "id": "ord-8820", "status": "COMPLETED" }
  ],
  "pagination": {
    "page": 0,
    "size": 20,
    "totalElements": 142,
    "totalPages": 8,
    "first": true,
    "last": false
  }
}
```

**Error response:**
```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "The request contains invalid data",
    "traceId": "abc-123-def-456",
    "timestamp": "2025-01-15T10:30:00Z",
    "details": [
      {
        "field": "email",
        "code": "INVALID_FORMAT",
        "message": "Enter a valid email address"
      },
      {
        "field": "amount",
        "code": "BELOW_MINIMUM",
        "message": "Amount must be at least 0.01"
      }
    ]
  }
}
```

### 4.2 Error code conventions

Error codes are UPPER_SNAKE_CASE strings, not numeric codes. They must
be stable -- once published, an error code is part of the API contract
and cannot be renamed without a version bump.

**Standard error codes agents must use:**

| Code | HTTP status | When to use |
|---|---|---|
| `VALIDATION_FAILED` | 400 | One or more request fields failed validation |
| `MISSING_REQUIRED_FIELD` | 400 | Required field not present |
| `INVALID_FORMAT` | 400 | Field present but wrong format |
| `UNAUTHENTICATED` | 401 | No valid authentication token |
| `INSUFFICIENT_PERMISSIONS` | 403 | Token valid but lacks required scope |
| `RESOURCE_NOT_FOUND` | 404 | Requested resource does not exist |
| `RESOURCE_CONFLICT` | 409 | Duplicate or concurrent modification conflict |
| `BUSINESS_RULE_VIOLATION` | 422 | Semantically invalid (business logic rejection) |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server-side error |
| `SERVICE_UNAVAILABLE` | 503 | Downstream dependency unavailable |

### 4.3 Field naming conventions

| Rule | Correct | Incorrect |
|---|---|---|
| camelCase for all fields | `orderId`, `createdAt` | `order_id`, `OrderId` |
| Dates in ISO 8601 UTC | `"2025-01-15T10:30:00Z"` | `"15/01/2025"`, Unix timestamp |
| Monetary amounts as strings | `"amount": "99.99"` | `"amount": 99.99` (floating point) |
| Currency as ISO 4217 code | `"currency": "NOK"` | `"currency": "Norwegian Krone"` |
| Identifiers as strings | `"id": "ord-8821"` | `"id": 8821` |
| Booleans as booleans | `"isActive": true` | `"isActive": "true"`, `"isActive": 1` |
| Enums as UPPER_SNAKE_CASE strings | `"status": "IN_PROGRESS"` | `"status": 2` |
| Null fields omitted or explicit | Agree per API -- be consistent | Mix of omitted and null |

### 4.4 Monetary amounts

Never use floating point for monetary values. Always use string
representation with explicit decimal places, and always include currency.

```json
{
  "price": {
    "amount": "99.99",
    "currency": "NOK"
  }
}
```

```java
// Java -- use BigDecimal, never double or float for money
@JsonSerialize(using = ToStringSerializer.class)
private BigDecimal amount;
```

---

## 5. Query parameters

### 5.1 Standard query parameters

Agents must use these exact parameter names across all APIs for
consistency. Consumers should be able to predict parameter names.

| Parameter | Type | Purpose | Example |
|---|---|---|---|
| `page` | integer (0-based) | Page number for offset pagination | `?page=0` |
| `size` | integer | Page size | `?size=20` |
| `sort` | string | Sort field and direction | `?sort=createdAt,DESC` |
| `filter` | string | Filter expression | `?filter=status==PENDING` |
| `search` | string | Free text search | `?search=nordic` |
| `fields` | string | Sparse fieldset | `?fields=id,status,createdAt` |
| `include` | string | Include related resources | `?include=items,customer` |
| `cursor` | string | Cursor for cursor-based pagination | `?cursor=eyJpZCI6...` |
| `limit` | integer | Limit for cursor-based pagination | `?limit=20` |
| `from` | ISO 8601 date | Date range start | `?from=2025-01-01T00:00:00Z` |
| `to` | ISO 8601 date | Date range end | `?to=2025-01-31T23:59:59Z` |

### 5.2 Filtering conventions

```
# Simple equality filter
GET /api/v1/orders?filter=status==PENDING

# Multiple filters (AND)
GET /api/v1/orders?filter=status==PENDING,customerId==cust-123

# Range filter
GET /api/v1/orders?filter=amount=gt=100.00

# Operators: == (eq), != (neq), =gt= (gt), =lt= (lt), =ge= (gte), =le= (lte)
# Based on RSQL filter syntax -- use rsql-parser library for Java
```

---

## 6. Pagination

All list endpoints must be paginated. See also
`PERFORMANCE_GUIDELINES.md` section 5 for page size limits.

### 6.1 Offset pagination response

```java
// Standard paginated response wrapper
public record PageResponse<T>(
    List<T> data,
    PaginationMetadata pagination
) {
    public static <T> PageResponse<T> from(Page<T> page) {
        return new PageResponse<>(
            page.getContent(),
            new PaginationMetadata(
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast()
            )
        );
    }
}

public record PaginationMetadata(
    int page,
    int size,
    long totalElements,
    int totalPages,
    boolean first,
    boolean last
) {}
```

### 6.2 Cursor pagination response

```java
public record CursorPageResponse<T>(
    List<T> data,
    CursorMetadata pagination
) {}

public record CursorMetadata(
    String nextCursor,
    String previousCursor,
    boolean hasMore,
    int size
) {}
```

---

## 7. API security requirements

These supplement `SECURITY_STANDARDS.md` with API-specific rules.

### 7.1 Authentication headers

```
# Required -- Bearer token in Authorization header
Authorization: Bearer eyJhbGciOiJSUzI1NiJ9...

# Forbidden -- token in query parameter (appears in logs)
GET /api/v1/orders?token=eyJhbGciOiJSUzI1NiJ9...

# Forbidden -- token in custom header (non-standard)
X-Auth-Token: eyJhbGciOiJSUzI1NiJ9...
```

### 7.2 Required response headers

Agents must generate these headers on all API responses:

```java
// Required security headers for all API responses
response.addHeader("X-Content-Type-Options", "nosniff");
response.addHeader("X-Frame-Options", "DENY");
response.addHeader("Cache-Control", "no-store");
response.addHeader("X-Trace-Id", traceId);        // distributed tracing
response.addHeader("X-Request-Id", requestId);    // request correlation
```

### 7.3 Rate limiting headers

When rate limiting is applied, include these standard headers:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 742
X-RateLimit-Reset: 1705312800
Retry-After: 60
```

### 7.4 CORS configuration

```java
// REQUIRED -- explicit CORS configuration, no wildcards for authenticated APIs
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of(
        "https://www.telia.no",
        "https://www.telia.se",
        "https://admin.telia.internal"
    ));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
    config.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Request-Id"));
    config.setAllowCredentials(true);
    config.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/api/**", config);
    return source;
}
```

---

## 8. OpenAPI specification requirements

Every API must have an OpenAPI 3.1 specification. The Spec Writer Agent
generates this from plain-language descriptions. The following elements
are mandatory in every spec.

### 8.1 Required spec elements

```yaml
openapi: "3.1.0"
info:
  title: Orders API
  version: "1.0.0"
  description: |
    Manages customer orders lifecycle from creation through fulfilment.
  contact:
    name: Orders Team
    email: orders-team@telia.com
  license:
    name: Internal -- Telia Group

servers:
  - url: https://api.telia.no/api/v1
    description: Production
  - url: https://api-staging.telia.no/api/v1
    description: Staging

security:
  - bearerAuth: []

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

### 8.2 Required per-endpoint elements

```yaml
paths:
  /orders:
    post:
      summary: Create a new order         # required -- short description
      operationId: createOrder            # required -- unique, camelCase
      tags: [Orders]                      # required -- for grouping in docs
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateOrderRequest'
            example:                      # required -- at least one example
              customerId: "cust-1234"
              items:
                - productId: "prod-5678"
                  quantity: 2
      responses:
        '201':
          description: Order created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/OrderResponse'
        '400':
          $ref: '#/components/responses/ValidationError'
        '401':
          $ref: '#/components/responses/Unauthenticated'
        '403':
          $ref: '#/components/responses/Forbidden'
        '500':
          $ref: '#/components/responses/InternalError'
```

All error responses must be referenced from shared components -- never
define error response schemas inline per endpoint.

---

## 9. Event-driven API conventions (Kafka)

For Kafka event contracts, see `sdlc/qa/KAFKA_TEST_GUIDE.md` and
`security/EVENT_SCHEMA_STANDARDS.md` for full detail. These are the
high-level conventions agents must follow when designing event schemas.

### 9.1 Event naming

```
# Topic naming: {domain}.{entity}.{event-type}
# All lowercase, hyphens for multi-word, past tense for events

order.order.created
order.order.cancelled
payment.payment.processed
customer.address.updated

# Forbidden
order-created          # missing domain
orderCreated           # camelCase
ORDER_CREATED          # uppercase
```

### 9.2 Standard event envelope

All events must include this standard envelope regardless of payload:

```json
{
  "eventId": "evt-uuid-here",
  "eventType": "order.order.created",
  "eventVersion": "1.0",
  "occurredAt": "2025-01-15T10:30:00Z",
  "correlationId": "req-abc-123",
  "source": "order-service",
  "payload": {
    "orderId": "ord-8821",
    "customerId": "cust-1234",
    "status": "CREATED"
  }
}
```

---

## 10. API review checklist for agents

| # | Check | Severity |
|---|---|---|
| R01 | Resource paths use nouns, not verbs | WARN |
| R02 | Collections are plural, lowercase, hyphen-separated | WARN |
| R03 | Correct HTTP status codes used | WARN |
| R04 | Standard response envelope used | BLOCK |
| R05 | Monetary amounts use string representation | BLOCK |
| R06 | Dates in ISO 8601 UTC format | BLOCK |
| R07 | Error responses use standard error codes | WARN |
| R08 | All list endpoints are paginated | BLOCK |
| R09 | OpenAPI spec exists and is complete | WARN |
| R10 | Each endpoint has at least one request/response example | WARN |
| R11 | Authentication via Bearer token in Authorization header | BLOCK |
| R12 | No credentials in query parameters | BLOCK |
| R13 | CORS configured explicitly, no wildcards | BLOCK |
| R14 | Required response headers generated | WARN |
| R15 | Breaking changes increment API version | BLOCK |
| R16 | Deprecated versions include Deprecation header | WARN |
| R17 | Nesting depth does not exceed 2 levels | WARN |
| R18 | field names are camelCase | WARN |

---

## 11. Version and review

| Attribute | Value |
|---|---|
| File owner | CoE Core + Architect representatives |
| Review cadence | Quarterly |
| Last reviewed | 2025-01 |
| Next review due | 2025-04 |
| Approvers | CoE Lead, Architect representative |
| Change process | PR to ai-engineering-common, 2 CoE approvals required |
| Standards basis | OpenAPI 3.1, RFC 7807 (Problem Details), RFC 6749 (OAuth 2.0) |
