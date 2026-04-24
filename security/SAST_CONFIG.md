# SAST_CONFIG.md
# Security -- Static Application Security Testing configuration reference
# Version: 1.0.0
# Status: Active
# Last updated: 2025-01
# Owner: CoE Core + Security Lead

---

## 1. Purpose

This file defines the standard SAST tool configuration for each
supported tech stack. The Pipeline Agent (A29) references this file
when generating CI/CD workflow files. Teams copy the relevant
configuration into their repositories and adjust only where noted.

---

## 2. Java / Spring Boot -- SpotBugs + Find Security Bugs

SpotBugs with the Find Security Bugs plugin is the standard SAST
tool for Java services.

### 2.1 Maven configuration

Add to pom.xml:

```xml
<build>
  <plugins>
    <plugin>
      <groupId>com.github.spotbugs</groupId>
      <artifactId>spotbugs-maven-plugin</artifactId>
      <version>4.8.3.0</version>
      <configuration>
        <effort>Max</effort>
        <threshold>Low</threshold>
        <failOnError>true</failOnError>
        <plugins>
          <plugin>
            <groupId>com.h3xstream.findsecbugs</groupId>
            <artifactId>findsecbugs-plugin</artifactId>
            <version>1.13.0</version>
          </plugin>
        </plugins>
        <excludeFilterFile>spotbugs-exclude.xml</excludeFilterFile>
      </configuration>
      <executions>
        <execution>
          <goals><goal>check</goal></goals>
        </execution>
      </executions>
    </plugin>
  </plugins>
</build>
```

### 2.2 Standard exclusion filter

Create `spotbugs-exclude.xml` in the project root:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<FindBugsFilter>

  <!-- Exclude generated code -->
  <Match>
    <Source name="~.*\.generated\..*"/>
  </Match>

  <!-- Exclude test classes from SAST (tested separately) -->
  <Match>
    <Class name="~.*Test"/>
  </Match>
  <Match>
    <Class name="~.*IT"/>
  </Match>

  <!-- Exclude Spring Boot application entry point -->
  <Match>
    <Class name="~.*Application"/>
    <Bug category="SECURITY"/>
  </Match>

  <!-- False positive: Spring @Value injection is safe -->
  <Match>
    <Bug pattern="HARD_CODE_PASSWORD"/>
    <Method name="~set.*"/>
  </Match>

</FindBugsFilter>
```

### 2.3 CI integration

```yaml
# In .github/workflows/ci.yml
- name: SAST scan (SpotBugs + Find Security Bugs)
  run: ./mvnw spotbugs:check
  # Fails build on any bug with threshold Low or above
  # Results uploaded to GitHub Security tab automatically
```

### 2.4 Key rules enforced

Find Security Bugs enforces these categories relevant to Telia services:

| Category | Examples caught |
|---|---|
| SQL injection | String concatenation in JPQL, native queries |
| XSS | Unescaped output in Thymeleaf, JSP |
| Hardcoded credentials | Literal strings in auth configuration |
| Insecure randomness | Math.random() used for security purposes |
| Path traversal | Unsanitised file paths from user input |
| XXE | XML parsing without secure factory configuration |
| SSRF | HTTP client with user-controlled URL |

---

## 3. TypeScript / Node.js -- ESLint Security plugin

### 3.1 ESLint configuration

```json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:security/recommended"
  ],
  "plugins": [
    "@typescript-eslint",
    "security"
  ],
  "rules": {
    "security/detect-object-injection": "error",
    "security/detect-non-literal-regexp": "error",
    "security/detect-non-literal-fs-filename": "error",
    "security/detect-eval-with-expression": "error",
    "security/detect-pseudoRandomBytes": "error",
    "security/detect-possible-timing-attacks": "warn",
    "security/detect-unsafe-regex": "error",
    "no-eval": "error",
    "no-new-func": "error"
  }
}
```

### 3.2 Install dependencies

```bash
npm install --save-dev eslint-plugin-security @typescript-eslint/eslint-plugin
```

### 3.3 CI integration

```yaml
- name: SAST scan (ESLint security)
  run: npm run lint
  # Add to package.json scripts:
  # "lint": "eslint src --ext .ts,.tsx --max-warnings 0"
```

---

## 4. C# / .NET -- Roslyn Analyzers + Security Code Scan

### 4.1 NuGet package reference

Add to the project .csproj file:

```xml
<ItemGroup>
  <PackageReference Include="SecurityCodeScan.VS2019" Version="5.6.7">
    <PrivateAssets>all</PrivateAssets>
    <IncludeAssets>runtime; build; native; contentfiles; analyzers</IncludeAssets>
  </PackageReference>
  <PackageReference Include="Microsoft.CodeAnalysis.NetAnalyzers" Version="8.0.0">
    <PrivateAssets>all</PrivateAssets>
    <IncludeAssets>runtime; build; native; contentfiles; analyzers</IncludeAssets>
  </PackageReference>
</ItemGroup>
```

### 4.2 Analysis configuration

Add to .editorconfig or create a separate security.editorconfig:

```ini
[*.cs]
dotnet_analyzer_diagnostic.category-Security.severity = error
dotnet_diagnostic.CA5350.severity = error    # Weak cryptographic algorithm
dotnet_diagnostic.CA5351.severity = error    # Broken cryptographic algorithm
dotnet_diagnostic.CA5359.severity = error    # Certificate validation disabled
dotnet_diagnostic.CA5360.severity = error    # Insecure deserialization
dotnet_diagnostic.CA5364.severity = error    # Deprecated security protocols (TLS 1.0/1.1)
dotnet_diagnostic.CA5394.severity = error    # Insecure random
dotnet_diagnostic.SCS0001.severity = error   # SQL injection (SecurityCodeScan)
dotnet_diagnostic.SCS0007.severity = error   # XML injection
dotnet_diagnostic.SCS0026.severity = error   # LDAP injection
```

### 4.3 CI integration

```yaml
- name: SAST scan (.NET analyzers)
  run: dotnet build /p:TreatWarningsAsErrors=true /warnaserror
  # Roslyn analyzers run during build -- no separate step needed
```

---

## 5. Secrets scanning -- Trufflehog

All stacks use Trufflehog for secrets scanning. This is in addition
to the Secrets Scan Agent (A25) which runs per PR.

### 5.1 CI configuration

```yaml
- name: Secrets scan (Trufflehog)
  uses: trufflesecurity/trufflehog@main
  with:
    path: ./
    base: ${{ github.event.repository.default_branch }}
    head: HEAD
    extra_args: --only-verified
```

`--only-verified` reduces false positives by only reporting secrets
that Trufflehog can verify are active (e.g. actual valid AWS keys).

### 5.2 Baseline file

For repositories that have pre-existing false positives, create a
baseline file:

```bash
# Generate baseline on the current state (one-time setup)
trufflehog filesystem --only-verified --json . > .trufflehog-baseline.json
```

Then add to the CI step:

```yaml
extra_args: --only-verified --baseline-path=.trufflehog-baseline.json
```

---

## 6. OWASP Dependency Check

All stacks use OWASP Dependency Check for dependency vulnerability
scanning. This runs alongside the Vuln Scan Agent (A23).

### 6.1 Maven configuration

```xml
<plugin>
  <groupId>org.owasp</groupId>
  <artifactId>dependency-check-maven</artifactId>
  <version>9.0.10</version>
  <configuration>
    <failBuildOnCVSS>7</failBuildOnCVSS>
    <!-- Fail on High (7.0+) or Critical CVEs -->
    <suppressionFile>dependency-check-suppressions.xml</suppressionFile>
    <nvdApiKey>${env.NVD_API_KEY}</nvdApiKey>
  </configuration>
  <executions>
    <execution>
      <goals><goal>check</goal></goals>
    </execution>
  </executions>
</plugin>
```

### 6.2 Suppression file template

```xml
<?xml version="1.0" encoding="UTF-8"?>
<suppressions xmlns="https://jeremylong.github.io/DependencyCheck/dependency-suppression.1.3.xsd">

  <!--
    Suppressions are temporary. Every suppression must have:
    - A CVE ID
    - A reason it is suppressed (false positive or accepted risk)
    - An expiry date (max 90 days)
    Suppressions without expiry are rejected by the Security Lead review.
  -->

  <!--
  <suppress until="2025-04-01Z">
    <notes>False positive: CVE-2024-NNNNN affects the web UI module of
    library X which we do not use. Confirmed by Security Lead 2025-01-15.</notes>
    <cve>CVE-2024-NNNNN</cve>
  </suppress>
  -->

</suppressions>
```

---

## 7. Security scan failure protocol

When a SAST scan fails in CI:

```
1. Read the finding description carefully -- understand what it flags
2. Check if it is a true positive or false positive:
   True positive:  Fix the code before merging
   False positive: Document in the suppression file with reason and expiry
                   Present to Security Lead (gate D02 or equivalent)

3. Do NOT:
   -- Disable the scanner to make the build pass
   -- Add broad suppressions (by file or package) without Security Lead approval
   -- Merge a PR with a failing security scan

4. For urgent hotfixes:
   Security Lead can approve a temporary suppression with a 7-day expiry
   The fix must be applied within the expiry window
```

---

## 8. Version and review

| File owner | CoE Core + Security Lead |
| Review cadence | Quarterly -- update tool versions and rules as landscape changes |
| Last reviewed | 2025-01 |
| Next review due | 2025-04 |
| Approvers | Security Lead, CoE Lead |
| Change process | PR with Security Lead approval required |
