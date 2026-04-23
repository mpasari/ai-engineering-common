# SECURITY_STANDARDS.md

# AI Engineering Commons — Security Standards for All Code Generation

# Version: 1.0.0

# Status: Active

# Last updated: 2026-05

# Owner: Security Lead + CoE Core

---

## 1. Purpose

This file defines the security requirements that apply to all code generated,
reviewed, or modified by any agent in the ai-engineering-commons system.

AGENT.md section 4.4 makes compliance with this file non-negotiable. When an
agent generates code that would violate any standard defined here, the agent
must refuse, explain the violation clearly, and offer a compliant alternative.

This file covers:

- OWASP Top 10 mandatory mitigations
- Authentication and authorisation patterns
- Input validation and output encoding
- Secrets and credential handling in code
- Dependency security requirements
- Logging and error handling security
- Transport security
- Language-specific security rules (Java, TypeScript/React, C#)

Agents use this file as a checklist during code generation and code review.
The Peer Review Agent and Security Review Agent treat every item here as a
required check on every PR.

---

## 2. OWASP Top 10 — mandatory mitigations

Every item below is a hard requirement. Code that violates any of these is
rejected by the Security Review Agent and must be fixed before merge.

### 2.1 Injection (A03)

**SQL injection — never do this:**

```java
// FORBIDDEN — string concatenation in SQL
String query = "SELECT * FROM users WHERE id = " + userId;
Statement stmt = conn.createStatement();
stmt.executeQuery(query);
```

**Always use parameterised queries or prepared statements:**

```java
// REQUIRED — parameterised query
String query = "SELECT * FROM users WHERE id = ?";
PreparedStatement stmt = conn.prepareStatement(query);
stmt.setInt(1, userId);
stmt.executeQuery();
```

The same rule applies to:

- NoSQL queries (use driver-provided parameterisation)
- LDAP queries (escape all user input)
- OS command execution (never interpolate user input into shell commands)
- XML/XPath queries (use parameterised XPath)
- GraphQL (use variables, never string interpolation)

Agents must never generate string concatenation into any query language.
If the task requires dynamic query construction, use a query builder library
with parameterisation support and flag this for Tech Lead review.

### 2.2 Broken authentication (A07)

Required patterns:

```java
// Password storage — always use bcrypt, scrypt, or Argon2
// NEVER store passwords as plain text, MD5, SHA-1, or SHA-256
PasswordEncoder encoder = new BCryptPasswordEncoder(12);
String hashed = encoder.encode(rawPassword);
```

```java
// Session tokens — use cryptographically secure random generation
SecureRandom random = new SecureRandom();
byte[] tokenBytes = new byte[32];
random.nextBytes(tokenBytes);
String token = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
```

Agents must not generate:

- Custom authentication implementations (use established libraries)
- Session IDs based on sequential numbers, timestamps, or predictable values
- Authentication logic that bypasses standard framework auth
- Remember-me tokens stored in plain text

### 2.3 Sensitive data exposure (A02)

```java
// FORBIDDEN — logging sensitive data
log.info("User {} logged in with password {}", username, password);
log.debug("Processing payment for card {}", cardNumber);

// REQUIRED — log identity, not credentials
log.info("User {} authenticated successfully", username);
log.info("Payment processing initiated for transaction {}", transactionId);
```

Agents must not generate code that logs:

- Passwords or password hashes
- Full credit card numbers (last 4 digits only)
- National ID numbers (fødselsnummer etc.)
- API keys or tokens
- Session tokens or cookies
- Health data
- Full connection strings

### 2.4 Insecure direct object references (A01)

```java
// FORBIDDEN — trusting user-supplied ID without ownership check
@GetMapping("/document/{id}")
public Document getDocument(@PathVariable Long id) {
    return documentRepository.findById(id).orElseThrow();
    // Anyone can access any document by guessing the ID
}

// REQUIRED — verify ownership before returning
@GetMapping("/document/{id}")
public Document getDocument(@PathVariable Long id,
                            @AuthenticationPrincipal User currentUser) {
    Document doc = documentRepository.findById(id).orElseThrow();
    if (!doc.getOwnerId().equals(currentUser.getId())) {
        throw new AccessDeniedException("Not authorised to access this document");
    }
    return doc;
}
```

Every endpoint that retrieves a resource by ID must verify that the
authenticated user has permission to access that specific resource.
Agents must generate authorisation checks alongside retrieval logic —
never retrieval alone.

### 2.5 Security misconfiguration (A05)

Agents must never generate:

- Debug endpoints enabled in production configuration
- Default credentials or placeholder passwords in configuration files
- CORS configured with wildcard origin (`*`) for authenticated endpoints
- Error responses that expose stack traces, internal paths, or framework versions
- Disabled CSRF protection without explicit justification and compensating control
- HTTP (non-TLS) endpoints for authenticated or sensitive operations

```java
// FORBIDDEN — exposing stack trace to client
@ExceptionHandler(Exception.class)
public ResponseEntity<String> handleError(Exception e) {
    return ResponseEntity.status(500).body(e.getMessage()); // leaks internals
}

// REQUIRED — safe error response
@ExceptionHandler(Exception.class)
public ResponseEntity<ErrorResponse> handleError(Exception e) {
    log.error("Unhandled exception", e); // full detail goes to logs only
    return ResponseEntity.status(500)
        .body(new ErrorResponse("An unexpected error occurred", errorId));
}
```

### 2.6 Vulnerable and outdated components (A06)

Agents must:

- Reference only libraries listed in DEPENDENCY_POLICY.md as approved
- Flag any dependency addition as requiring Vulnerability Scan Agent review
- Never suggest pinning to a specific version known to have CVEs
- Always use the latest patch version within the approved minor version range

### 2.7 Cross-site scripting (A03 — XSS)

For any TypeScript/React code that renders user-controlled content:

```typescript
// FORBIDDEN — direct HTML injection
function UserBio({ bio }: { bio: string }) {
  return <div dangerouslySetInnerHTML={{ __html: bio }} />;
}

// REQUIRED — React's default escaping (just render as text)
function UserBio({ bio }: { bio: string }) {
  return <div>{bio}</div>;
}
```

`dangerouslySetInnerHTML` is forbidden in all agent-generated code unless:

- The content is generated entirely server-side from trusted sources
- It has been processed through a vetted HTML sanitisation library
- The usage is explicitly approved by the Security Lead in the Jira ticket

### 2.8 Insecure deserialisation (A08)

```java
// FORBIDDEN — deserialising untrusted data with native Java serialisation
ObjectInputStream ois = new ObjectInputStream(request.getInputStream());
Object obj = ois.readObject();

// REQUIRED — use JSON with schema validation for external data
ObjectMapper mapper = new ObjectMapper();
mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, true);
UserRequest req = mapper.readValue(request.getInputStream(), UserRequest.class);
```

Agents must not use Java native serialisation for any data that crosses
a trust boundary (user input, external API responses, message queue payloads).

### 2.9 Insufficient logging and monitoring (A09)

Every security-relevant event must be logged at the appropriate level.
Agents must generate logging for:

```java
// Required log events — agents must include these automatically
log.warn("Failed login attempt for user: {}", username);           // auth failure
log.warn("Access denied: user {} attempted to access {}", userId, resourceId); // authz failure
log.info("User {} changed password", userId);                      // credential change
log.info("Admin action: {} performed {} on {}", adminId, action, targetId); // admin ops
log.warn("Rate limit exceeded for IP: {}", clientIp);              // rate limiting
log.error("Data validation failed for field {}: {}", field, reason); // input rejection
```

Log entries must contain: timestamp (automatic via logging framework),
severity level, event description, relevant IDs (user, resource, transaction)
but never the sensitive values themselves.

### 2.10 Server-side request forgery (A10)

```java
// FORBIDDEN — fetching arbitrary user-supplied URLs
@PostMapping("/fetch")
public String fetchContent(@RequestBody FetchRequest req) {
    URL url = new URL(req.getUrl()); // user controls the destination
    return fetchFromUrl(url);
}

// REQUIRED — allowlist of permitted destinations
private static final Set<String> ALLOWED_HOSTS = Set.of(
    "api.trusted-partner.com",
    "data.internal-service.telia.com"
);

@PostMapping("/fetch")
public String fetchContent(@RequestBody FetchRequest req) {
    URL url = new URL(req.getUrl());
    if (!ALLOWED_HOSTS.contains(url.getHost())) {
        throw new SecurityException("Destination not permitted: " + url.getHost());
    }
    return fetchFromUrl(url);
}
```

---

## 3. Authentication and authorisation patterns

### 3.1 Required authentication approach

All Telia services use OAuth 2.0 / OpenID Connect via the CIAM platform.
Agents must generate authentication integration using the approved CIAM
client libraries, not custom OAuth implementations.

```java
// Spring Security OAuth2 Resource Server — standard pattern
@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/health", "/metrics").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtConverter()))
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            );
        return http.build();
    }
}
```

### 3.2 Role-based access control

```java
// Method-level security — always prefer this over manual checks
@PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
@GetMapping("/admin/users")
public List<User> getAllUsers() { ... }

// For resource ownership checks — use a custom security expression
@PreAuthorize("@resourceSecurity.isOwner(#id, authentication)")
@GetMapping("/documents/{id}")
public Document getDocument(@PathVariable Long id) { ... }
```

Agents must never implement role checks as:

- String comparisons in business logic
- Database lookups on every request without caching
- Checks that can be bypassed by request manipulation

### 3.3 API key authentication (service-to-service)

```java
// Service-to-service — always use short-lived tokens, not long-lived API keys
// If API keys are required by a legacy partner, they must be:
// 1. Stored in Azure Key Vault — never in code or config files
// 2. Rotated on a schedule defined in SRE_SERVICE_CONFIG.md
// 3. Transmitted only over TLS in headers, never in query parameters
// 4. Validated server-side on every request, not cached in memory indefinitely
```

---

## 4. Input validation

All input from external sources must be validated before use. External sources
include: HTTP request bodies, query parameters, headers, message queue payloads,
file uploads, and data read from external APIs.

### 4.1 Validation approach

```java
// Use Bean Validation (JSR-380) for request DTOs
public class CreateUserRequest {

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be 3-50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_-]+$", message = "Username may only contain letters, numbers, hyphens and underscores")
    private String username;

    @NotBlank
    @Email(message = "Valid email address required")
    private String email;

    @NotNull
    @Min(value = 0, message = "Amount cannot be negative")
    @Max(value = 1000000, message = "Amount exceeds maximum")
    private BigDecimal amount;
}
```

### 4.2 Validation rules agents must always apply


| Input type         | Required validation                                                                  |
| ------------------ | ------------------------------------------------------------------------------------ |
| String identifiers | Max length, character allowlist, no SQL/script characters                            |
| Email addresses    | Format validation via @Email, max length 254 chars                                   |
| Numeric values     | Min/max range, null check, integer vs decimal type match                             |
| Dates              | Format validation, reasonable range (not year 1900 or 9999)                          |
| URLs               | Protocol allowlist (https only for external), host allowlist                         |
| File uploads       | File type validation (magic bytes, not just extension), max size, virus scan trigger |
| Free text fields   | Max length, XSS sanitisation if rendered as HTML                                     |
| Enum values        | Explicit validation against known values, reject unknown                             |


### 4.3 Fail closed

When validation is uncertain, reject the input. Never permit uncertain input
on the assumption it will be handled safely downstream. Validation failures
must return a structured error response with the specific field and reason,
without revealing internal implementation details.

---

## 5. Secrets and credential handling in code

### 5.1 Where secrets must be stored


| Secret type                 | Required storage                                  |
| --------------------------- | ------------------------------------------------- |
| Database passwords          | Azure Key Vault, injected as environment variable |
| API keys (third party)      | Azure Key Vault, injected at runtime              |
| Service account credentials | Azure Managed Identity (no credential at all)     |
| Kafka credentials           | Azure Key Vault or Kubernetes secret              |
| Encryption keys             | Azure Key Vault — never in application code       |
| JWT signing keys            | Azure Key Vault, rotated on defined schedule      |


### 5.2 How to read secrets in code

```java
// REQUIRED — read from environment variable (injected from Key Vault at deploy)
@Value("${DB_PASSWORD}")
private String dbPassword;

// REQUIRED — Spring Cloud Azure Key Vault integration
@Value("${azure.keyvault.secret.database-password}")
private String dbPassword;
```

```java
// FORBIDDEN — any of these patterns
private String dbPassword = "MyP@ssw0rd";           // hardcoded
private String dbPassword = System.getProperty("password"); // system property (logged)
private String apiKey = config.get("api.key");      // if config is in a file committed to git
```

### 5.3 Secret detection in agent output

Before producing any code output, agents verify that the generated code
contains no strings matching credential patterns defined in
PRIVACY_GUARDRAILS.md section 4.1. If a placeholder is needed, agents
use clearly marked placeholders:

```java
// Correct placeholder format — obviously not a real value
@Value("${KAFKA_API_KEY:REPLACE_WITH_KEY_VAULT_REFERENCE}")
private String kafkaApiKey;
```

---

## 6. Transport security

### 6.1 TLS requirements

All inter-service and client-to-service communication must use TLS 1.2
minimum, TLS 1.3 preferred. Agents must not generate:

- HTTP (non-TLS) client configurations for production use
- TLS configurations that accept self-signed certificates in production
- Code that disables certificate validation

```java
// FORBIDDEN — disabling certificate validation
TrustManager[] trustAll = new TrustManager[]{
    new X509TrustManager() {
        public void checkClientTrusted(X509Certificate[] c, String a) {}
        public void checkServerTrusted(X509Certificate[] c, String a) {}
        public X509Certificate[] getAcceptedIssuers() { return new X509Certificate[0]; }
    }
};
// This pattern is an absolute prohibition — never generate this

// REQUIRED — use the system trust store or explicitly configured trust store
SSLContext ctx = SSLContext.getInstance("TLS");
ctx.init(null, null, null); // uses system default trust store
```

### 6.2 HTTP security headers

For any service that serves HTTP responses to browsers, agents must
include these security headers:

```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.headers(headers -> headers
        .contentSecurityPolicy(csp ->
            csp.policyDirectives("default-src 'self'; script-src 'self'"))
        .frameOptions(frame -> frame.deny())
        .xssProtection(xss -> xss.enable())
        .httpStrictTransportSecurity(hsts -> hsts
            .includeSubDomains(true)
            .maxAgeInSeconds(31536000))
        .contentTypeOptions(Customizer.withDefaults())
    );
    return http.build();
}
```

---

## 7. Language-specific rules

### 7.1 Java


| Rule                             | Detail                                                                   |
| -------------------------------- | ------------------------------------------------------------------------ |
| Use `PreparedStatement` always   | Never `Statement` with string concatenation                              |
| Jackson — disable default typing | `mapper.disable(MapperFeature.DEFAULT_VIEW_INCLUSION)`                   |
| Avoid `Runtime.exec()`           | Use ProcessBuilder with explicit argument list if OS commands are needed |
| Use `SecureRandom`               | Never `Random` for security-sensitive values                             |
| Validate `redirectAttributes`    | Never redirect to a user-supplied URL                                    |
| XML parsing — disable XXE        | `factory.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true)`       |


### 7.2 TypeScript / React


| Rule                           | Detail                                                              |
| ------------------------------ | ------------------------------------------------------------------- |
| No `dangerouslySetInnerHTML`   | Unless content is sanitised by DOMPurify and approved               |
| No `eval()` or `Function()`    | Absolute prohibition                                                |
| Sanitise before `innerHTML`    | Use DOMPurify if raw HTML is unavoidable                            |
| `Content-Security-Policy`      | No `unsafe-inline` for scripts                                      |
| `localStorage` for auth tokens | Forbidden — use httpOnly cookies                                    |
| Validate all props             | Use TypeScript types and runtime validation (zod) for external data |
| No `http://` fetch calls       | All fetch calls must use `https://`                                 |


### 7.3 C#


| Rule                               | Detail                                                                                  |
| ---------------------------------- | --------------------------------------------------------------------------------------- |
| Use parameterised queries          | Entity Framework parameterises by default — never use raw SQL with string interpolation |
| Use `SecureString` for credentials | Only when credentials must be in memory                                                 |
| Avoid `BinaryFormatter`            | Use `System.Text.Json` or `Newtonsoft.Json` instead                                     |
| Enable AntiForgery                 | `services.AddAntiforgery()` for all form endpoints                                      |
| Use `IHttpClientFactory`           | Never instantiate `HttpClient` directly in a loop                                       |
| Validate `ModelState`              | Always check `ModelState.IsValid` before processing                                     |


---

## 8. Security review checklist for agents

When the Peer Review Agent or Security Review Agent reviews a PR, it
checks every item in this list. Items marked BLOCK must be fixed before
merge. Items marked WARN are flagged for Tech Lead review.


| #   | Check                                                            | Severity |
| --- | ---------------------------------------------------------------- | -------- |
| S01 | No SQL/query string concatenation                                | BLOCK    |
| S02 | No hardcoded credentials or secrets                              | BLOCK    |
| S03 | No disabled TLS/certificate validation                           | BLOCK    |
| S04 | No `dangerouslySetInnerHTML` without sanitisation                | BLOCK    |
| S05 | No `eval()` or dynamic code execution                            | BLOCK    |
| S06 | No stack traces in HTTP responses                                | BLOCK    |
| S07 | No native Java deserialisation of untrusted data                 | BLOCK    |
| S08 | Authentication present on all non-public endpoints               | BLOCK    |
| S09 | Authorisation checks resource ownership, not just authentication | BLOCK    |
| S10 | No logging of passwords, tokens, or PII                          | BLOCK    |
| S11 | Input validation present for all external input                  | BLOCK    |
| S12 | Secrets read from environment/Key Vault, not code                | BLOCK    |
| S13 | All dependencies in DEPENDENCY_POLICY.md approved list           | WARN     |
| S14 | Security-relevant events logged (auth failure, access denial)    | WARN     |
| S15 | HTTP security headers configured for browser-facing services     | WARN     |
| S16 | CORS not configured with wildcard for authenticated endpoints    | WARN     |
| S17 | Rate limiting present on authentication endpoints                | WARN     |
| S18 | Error responses do not reveal internal paths or versions         | WARN     |
| S19 | File uploads validated by content type, not just extension       | WARN     |
| S20 | SSRF protection (URL allowlist) for any URL-fetching feature     | WARN     |


---

## 9. What agents must do when they detect a violation

When an agent detects that a task would require generating code violating
any BLOCK item in section 8:

1. Do not generate the violating code
2. Output:

```
SECURITY BLOCK — [Agent Name]

The requested implementation would violate security standard [S0X]:
[Standard name from section 8]

Requested pattern:
[Brief description of what was asked for]

Why this is blocked:
[One-sentence explanation of the risk]

Compliant alternative:
[The correct pattern, with code example if applicable]
```

1. Offer the compliant alternative and continue with the task
2. Log the detection (agent ID, timestamp, standard ID, Jira ticket if available)

For WARN items, agents flag the issue in the PR review comment but do not
block the generation. The flag must be visible to the Tech Lead reviewer.

---

## 10. Relationship to other files


| File                              | Relationship                                                                                 |
| --------------------------------- | -------------------------------------------------------------------------------------------- |
| `PRIVACY_GUARDRAILS.md`           | Governs what data enters prompts. This file governs how code handles data. Both apply.       |
| `DEPENDENCY_POLICY.md`            | Defines which libraries are approved. This file defines how approved libraries must be used. |
| `agents/SECURITY_REVIEW_AGENT.md` | The agent that enforces this file during PR review.                                          |
| `agents/VULN_SCAN_AGENT.md`       | Scans for dependency CVEs — complements this file's coding standards.                        |
| `sdlc/qa/SECURITY_TEST_GUIDE.md`  | How to test that these standards are met in the test suite.                                  |
| `COMPLIANCE_STANDARDS.md`         | Regulatory requirements that inform some of these standards.                                 |


---

## 11. Version and review


| Attribute       | Value                                                              |
| --------------- | ------------------------------------------------------------------ |
| File owner      | Security Lead + CoE Core                                           |
| Review cadence  | Quarterly, or immediately following any security incident          |
| Last reviewed   | 2025-01                                                            |
| Next review due | 2025-04                                                            |
| Approvers       | Security Lead, CoE Lead, Tech Lead representative                  |
| Change process  | PR to ai-engineering-commons, Security Lead approval required      |
| Standards basis | OWASP Top 10 2021, OWASP ASVS Level 2, Telia Group Security Policy |


