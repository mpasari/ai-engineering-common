# SECURITY_TEST_GUIDE.md
# SDLC -- QA Stage -- Security Testing Guide
# Version: 1.0.0
# Status: Active
# Last updated: 2026-04
# Owner: CoE Core + Security Lead
#
# This file is read by:
#   - Test Gen Agent (A15) -- security test generation
#   - Security Review Agent (A22) -- verification reference
#   - Peer Review Agent (A27) -- security test coverage check

---

## 1. Security test scope

Security testing covers four categories:

```
1. Authentication and authorisation tests
2. Input validation and injection prevention tests
3. Data protection tests (encryption, PII handling)
4. Dependency and supply chain security
```

---

## 2. Auth tests (required for every protected endpoint)

Every endpoint with auth must have these tests:

```java
// Pattern: SecurityTest -- one class per controller

@SpringBootTest(webEnvironment = RANDOM_PORT)
class OrderControllerSecurityTest {

    @Test
    void cancelOrder_withoutToken_returns401() {
        var response = restTemplate.postForEntity(
            "/api/v1/orders/{id}/cancel",
            new CancelOrderRequest("reason"),
            ErrorResponse.class,
            UUID.randomUUID());
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody().error().code()).isEqualTo("UNAUTHENTICATED");
    }

    @Test
    void cancelOrder_withInsufficientScope_returns403() {
        // User with read-only scope cannot cancel
        var response = restTemplate.exchange(
            RequestEntity.post("/api/v1/orders/{id}/cancel", UUID.randomUUID())
                .header("Authorization", "Bearer " + readOnlyToken())
                .body(new CancelOrderRequest("reason")),
            ErrorResponse.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void cancelOrder_withValidToken_andCorrectScope_returns200() {
        var order = createPendingOrder();
        var response = restTemplate.exchange(
            RequestEntity.post("/api/v1/orders/{id}/cancel", order.id())
                .header("Authorization", "Bearer " + validToken())
                .body(new CancelOrderRequest("reason")),
            OrderResponse.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }
}
```

---

## 3. Input validation tests

```java
@Test
void cancelOrder_withMissingReason_returns400() {
    var response = restTemplate.postForEntity(
        "/api/v1/orders/{id}/cancel",
        new CancelOrderRequest(null), // missing required field
        ErrorResponse.class,
        UUID.randomUUID());
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    assertThat(response.getBody().error().code()).isEqualTo("VALIDATION_FAILED");
}

@Test
void cancelOrder_withOverlongReason_returns400() {
    var reason = "x".repeat(1001); // exceeds max length
    var response = restTemplate.postForEntity(
        "/api/v1/orders/{id}/cancel",
        new CancelOrderRequest(reason),
        ErrorResponse.class,
        UUID.randomUUID());
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
}

@Test
void getOrder_withSqlInjectionAttempt_returns400OrSafeResult() {
    // SQL injection should be prevented by parameterised queries
    var response = restTemplate.getForEntity(
        "/api/v1/orders?customerId=1' OR '1'='1",
        OrderListResponse.class);
    // Either 400 (validation rejects) or 200 with safe empty result
    assertThat(response.getStatusCode())
        .isIn(HttpStatus.BAD_REQUEST, HttpStatus.OK);
}
```

---

## 4. PII handling tests

```java
@Test
void getOrder_doesNotExposeInternalIds() {
    // Internal database IDs must not be in API responses
    var response = restTemplate.getForEntity(
        "/api/v1/orders/{id}", OrderResponse.class, orderId);
    var json = objectMapper.writeValueAsString(response.getBody());
    assertThat(json).doesNotContain("customerId", "internalRef");
    // Only expose what the spec says should be exposed
}

@Test
void createOrder_piiFieldsAreStoredEncrypted() {
    // Verify PII fields are not stored in plaintext in the database
    var response = createOrder(buildOrderRequest());
    var dbRecord = jdbcTemplate.queryForMap(
        "SELECT * FROM orders WHERE id = ?", response.id());
    // Email field should be encrypted (not plaintext)
    assertThat(dbRecord.get("customer_email").toString())
        .doesNotContain("@example.com"); // encrypted value looks different
}
```

---

## 5. SAST and dependency scan

Automated in CI pipeline per PIPELINE_STANDARDS.md:
- SpotBugs (Java SAST) -- security bug patterns
- OWASP Dependency Check -- CVE scanning
- Trufflehog -- secrets in git history

Findings from these tools are routed to:
- Critical/High CVEs -> Vuln Scan Agent creates security tickets
- SAST findings -> Security Review Agent BLOCK findings
- Secrets -> Secrets Scan Agent creates security incidents

---

## 6. Penetration test checklist

For services handling financial transactions or sensitive PII,
a manual penetration test is required before production go-live.
Checklist items per OWASP Top 10:

```
[ ] A01 Broken access control -- test horizontal and vertical privilege escalation
[ ] A02 Cryptographic failures -- verify TLS, check no sensitive data in logs
[ ] A03 Injection -- SQL, command, LDAP injection tests
[ ] A05 Security misconfiguration -- check HTTP security headers
[ ] A07 Auth failures -- brute force, session management, token expiry
[ ] A09 Security logging -- verify sensitive actions are audited
```

Penetration test results require Security Lead review (gate E09 equivalent).

---

## 7. Version and review

| File owner | CoE Core + Security Lead |
| Review cadence | Quarterly |
