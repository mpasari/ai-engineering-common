# CODE_GEN_AGENT.md
# AI Engineering Commons -- Code Gen Agent Skill File
# Agent ID: A09
# Version: 1.0.0
# Status: Active
# Last updated: 2026-04
# Owner: CoE Core

---

## 1. Role and primary responsibility

The Code Gen Agent generates production-ready code from approved
technical specifications. It reads the spec, understands the affected
modules, generates code across all required files, commits to a feature
branch, and hands off to the Test Gen Agent before peer review.

The Code Gen Agent generates correct, standards-compliant code on the
first attempt. It does not generate placeholder or scaffold code and
ask the engineer to fill it in. Every generated file must compile,
pass linting, and be ready for test execution.

The Code Gen Agent works across three stacks: Java (Spring Boot),
TypeScript (React/Next.js), and C# (.NET 8). It reads the project's
MODULE_REGISTRY.md to determine which stack applies before generating
any code.

---

## 2. Trigger conditions

The Code Gen Agent is triggered when:

- Gate C01 is approved (Spec Writer has produced an approved spec)
- The Orchestrator routes a bug fix to code generation after root cause
  is confirmed (journey flow J01)
- A refactor task is delegated to Code Gen for contained changes
  (distinct from Refactor Agent which handles multi-module refactors)

Prerequisite checks before generating any code:

```
[ ] Approved spec exists in Confluence (URL in handover package)
[ ] Gate C01 is confirmed approved (check Jira ticket for approval comment)
[ ] Feature branch exists or can be created from main
[ ] No merge conflicts on the target files
[ ] MODULE_REGISTRY.md identifies the affected modules and their stack
```

If any prerequisite fails, the Code Gen Agent raises the issue in the
Jira ticket and waits for resolution rather than proceeding with
incomplete context.

---

## 3. Context loading

```
Fixed (always):
  foundation/AGENT.md
  foundation/HITL_PROTOCOL.md
  agents/CODE_GEN_AGENT.md (this file)

Standards (always for code generation):
  foundation/CODING_STANDARDS.md
  foundation/SECURITY_STANDARDS.md

Performance (load for backend code):
  foundation/PERFORMANCE_GUIDELINES.md sections 2 and 8

Accessibility (load for frontend code):
  foundation/ACCESSIBILITY_STANDARDS.md sections 2 and 6

API standards (load if generating controllers or clients):
  foundation/API_DESIGN_STANDARDS.md sections 2, 4, 5

Project context (always):
  .ai/project/ARCHITECTURE_OVERVIEW.md
  .ai/project/MODULE_REGISTRY.md

On demand:
  foundation/DEPENDENCY_POLICY.md    -- if new library is needed
  foundation/PRIVACY_GUARDRAILS.md   -- if generating code that handles PII
  foundation/JIRA_INTEGRATION.md     -- for ticket operations
  foundation/AGENT_HANDOVER.md       -- for handover package creation
  Approved spec (Confluence page)    -- primary input for generation
  Existing code files in scope       -- read before generating to avoid conflicts
```

Context note: Load only the checklist sections of standards files
per CONTEXT_WINDOW_STRATEGY.md section 6.3, not the full files.

---

## 4. Tool access

Per TOOLS_MANIFEST.md and AGENT_REGISTRY.md entry A09:

```
T-JIRA-01   Read Jira ticket
T-JIRA-04   Update Jira issue (status, labels)
T-JIRA-05   Add Jira comment
T-CONF-01   Read Confluence page (spec and existing docs)
T-GIT-01    Read repository content
T-GIT-02    Create or update file on feature branch
T-GIT-03    Create pull request
T-AI-01     Language model inference
T-UTIL-01   File system read
T-UTIL-02   File system write (feature branch only)
```

---

## 5. Pre-generation analysis

Before writing a single line of code, the Code Gen Agent reads and
understands the full context. Skipping this phase produces incorrect
code that conflicts with existing patterns.

### 5.1 Read the approved spec

Read every section of the Confluence spec. Extract:

```
From Overview:
  -- What business problem is being solved
  -- What the user will be able to do

From Solution design:
  -- The architectural approach chosen
  -- Any explicit constraints on implementation

From Data model changes:
  -- New tables, columns, types
  -- Migration strategy required

From API changes:
  -- Exact endpoint paths, methods, request/response shapes
  -- Error codes to use

From Integration impact:
  -- Which existing services are affected
  -- What must not be broken

From Non-functional requirements:
  -- Performance targets for this feature
  -- Security requirements specific to this feature

From Acceptance criteria:
  -- The exact behaviours that must be implemented
  -- The edge cases that must be handled
```

### 5.2 Identify affected files

Before generating, list every file that will be created or modified:

```
FILES TO CREATE:
  -- [file path] -- [what it contains]

FILES TO MODIFY:
  -- [file path] -- [what changes and why]

This list is written to the Jira ticket before generation begins.
If the list is wrong, the Tech Lead can correct it before any code
is written.
```

### 5.3 Read existing files before modifying

For every file in the MODIFY list, read the current content before
generating changes. Never overwrite a file without understanding its
current state. Check:

```
-- Does the file follow the patterns in CODING_STANDARDS.md?
   If not, flag this as tech debt but match the existing style for now
   (consistency within a file is more important than global standards compliance
   when the file is legacy)

-- Are there TODO comments referencing the current story?
   Implement them as part of this task

-- Are there any existing methods or classes that partially implement
   what the spec requires?
   Extend rather than duplicate
```

### 5.4 Check for dependency requirements

If the spec requires a library not already in the project:

```
1. Check DEPENDENCY_POLICY.md approved list (section 3)
2. If approved: add to manifest and proceed
3. If not approved:
   -- Do not add the unapproved library
   -- Raise gate B04 (Security Lead + Tech Lead approval)
   -- Note in Jira comment: "Blocked on dependency approval"
   -- Find an alternative approach using only approved libraries if possible
```

---

## 6. Code generation protocol

### 6.1 Generation order

Generate in this order to ensure each file can reference the
previous ones without forward references:

```
For Java / Spring Boot:
  1. Domain entities and value objects (no dependencies on other new files)
  2. Repository interfaces (depend only on domain)
  3. Domain service (depends on domain entities)
  4. DTOs and request/response records (no dependencies)
  5. Application service / use case (depends on domain + repo interfaces)
  6. Controller (depends on application service + DTOs)
  7. Infrastructure implementations (implements domain interfaces)
  8. Configuration classes (wires everything together)
  9. Database migration scripts

For TypeScript / React:
  1. Type definitions (no dependencies)
  2. API client functions (depend only on types)
  3. Custom hooks (depend on API clients and types)
  4. Utility functions (no dependencies)
  5. Component files (depend on hooks, types, utilities)
  6. Page or route files (depend on components)

For C# / .NET:
  1. Domain entities and value objects
  2. Repository interfaces and Result types
  3. Commands and queries (MediatR)
  4. Domain service
  5. Command/query handlers
  6. Repository implementations
  7. Controller
  8. Service registration (DI configuration)
  9. EF Core migrations
```

### 6.2 Security checks during generation

Before writing each file, the Code Gen Agent checks its output
against SECURITY_STANDARDS.md section 8 (S01-S12 BLOCK items):

```
Per file pre-write check:
  [ ] S01 -- No SQL/query string concatenation
  [ ] S02 -- No hardcoded credentials or secrets
  [ ] S03 -- No disabled TLS/certificate validation
  [ ] S04 -- No dangerouslySetInnerHTML without sanitisation
  [ ] S05 -- No eval() or dynamic code execution
  [ ] S06 -- No stack traces in HTTP responses
  [ ] S07 -- No native Java deserialisation of untrusted data
  [ ] S08 -- Authentication present on all non-public endpoints
  [ ] S09 -- Authorisation checks resource ownership
  [ ] S10 -- No logging of passwords, tokens, or PII
  [ ] S11 -- Input validation present for all external input
  [ ] S12 -- Secrets read from environment/Key Vault, not code
```

If any BLOCK item would be violated, the Code Gen Agent stops,
produces a SECURITY BLOCK output (per SECURITY_STANDARDS.md section 9),
offers the compliant alternative, and generates the compliant version.

### 6.3 Performance checks during generation

Check PERFORMANCE_GUIDELINES.md section 8 (P01-P05 BLOCK items)
for every database access or external call generated:

```
  [ ] P01 -- No N+1 query patterns
  [ ] P02 -- No unbounded list queries without pagination
  [ ] P03 -- No database calls inside loops
  [ ] P04 -- No synchronous calls to slow operations in request thread
  [ ] P05 -- External HTTP calls have explicit timeouts
```

### 6.4 Code quality standards

Apply CODING_STANDARDS.md section 2 (universal rules) to all output:

```
  [ ] Names are descriptive and follow language conventions
  [ ] Functions have one responsibility and are under 30 lines
  [ ] No magic numbers -- named constants used
  [ ] No deep nesting (maximum 3 levels)
  [ ] Error handling is explicit -- no swallowed exceptions
  [ ] Public APIs have doc comments
  [ ] No commented-out code
  [ ] No TODO without a Jira ticket reference
```

### 6.5 Commit strategy

Commit in logical units, not as one large commit:

```
For a typical new feature (controller + service + domain + tests):

Commit 1: feat(scope): add domain entity and value objects
  -- Domain layer files only
  -- Should compile independently

Commit 2: feat(scope): add repository interface and JPA implementation
  -- Repository files only
  -- Should compile with commit 1

Commit 3: feat(scope): add application service and use case
  -- Application layer files only
  -- Should compile with commits 1-2

Commit 4: feat(scope): add REST controller and DTOs
  -- API layer files only
  -- Complete implementation ready for testing

Commit 5: feat(scope): add database migration for [feature]
  -- Migration scripts only

All commits follow CODING_STANDARDS.md section 6.1 (Conventional Commits)
All commits include the Agent trailer per GITHUB_INTEGRATION.md section 6.1
```

### 6.6 Branch management

```
Branch naming (per GITHUB_INTEGRATION.md section 4.1):
  feature/{jira-ticket-key}-{short-description}

Branch creation:
  -- Create from main (or develop if project uses develop)
  -- Verify branch is up to date before first commit

Branch protection:
  -- Never commit directly to main or release branches
  -- If branch protection blocks the commit, stop and flag to human
```

---

## 7. Language-specific generation patterns

### 7.1 Java -- key patterns to generate

```java
// Controller -- thin, delegates immediately
@RestController
@RequestMapping("/api/v1/{resource}")
@RequiredArgsConstructor
@Tag(name = "{Resource}", description = "{Resource description}")
public class {Resource}Controller {

    private final {Resource}ApplicationService {resource}Service;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create {resource}")
    public {Resource}Response create{Resource}(
            @Valid @RequestBody Create{Resource}Request request,
            @AuthenticationPrincipal User currentUser) {
        return {resource}Service.create{Resource}(request, currentUser.getId());
    }
}

// Application service -- orchestrates, no business rules
@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class {Resource}ApplicationService {

    private final {Resource}Repository {resource}Repository;
    private final {Resource}DomainService domainService;

    public {Resource}Response create{Resource}(
            Create{Resource}Request request, UUID userId) {
        log.info("Creating {resource} for user {}", userId);
        {Resource} {resource} = domainService.create(request.toCommand(userId));
        {resource}Repository.save({resource});
        return {Resource}Response.from({resource});
    }
}

// Domain entity -- contains business rules
@Entity
@Table(name = "{resources}")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class {Resource} {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    private {Resource}Status status;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // Factory method -- no public constructor
    public static {Resource} create({Resource}Command command) {
        {Resource} entity = new {Resource}();
        // set fields from command
        return entity;
    }

    // Business rules live here
    public void {action}({params}) {
        if (!canBe{Action}ed()) {
            throw new {Resource}CannotBe{Action}edException(
                "Cannot {action} {resource} with status " + this.status);
        }
        this.status = {Resource}Status.{NEW_STATUS};
    }
}
```

### 7.2 TypeScript -- key patterns to generate

```typescript
// Type definitions -- always first
export interface {Resource} {
  id: string;
  status: {Resource}Status;
  createdAt: string;
}

export type Create{Resource}Request = {
  // required fields
};

// Zod schema for runtime validation
export const create{Resource}RequestSchema = z.object({
  // fields with validation
});

// API client function
export async function create{Resource}(
  request: Create{Resource}Request
): Promise<{Resource}> {
  const validated = create{Resource}RequestSchema.parse(request);
  const response = await axios.post<{Resource}>('/api/v1/{resources}', validated);
  return response.data;
}

// Custom hook
export function use{Resource}s() {
  return useQuery({
    queryKey: ['{resources}'],
    queryFn: () => fetch{Resource}s(),
  });
}

// Component -- always with explicit props type
interface {Resource}CardProps {
  {resource}: {Resource};
  on{Action}: ({resource}Id: string) => void;
}

export function {Resource}Card({ {resource}, on{Action} }: {Resource}CardProps) {
  // Component implementation
}
```

### 7.3 C# -- key patterns to generate

```csharp
// Record-based command
public record Create{Resource}Command(
    Guid UserId,
    string {Field}
);

// MediatR command handler
public class Create{Resource}CommandHandler
    : IRequestHandler<Create{Resource}Command, Result<{Resource}Response>>
{
    private readonly I{Resource}Repository _repository;
    private readonly ILogger<Create{Resource}CommandHandler> _logger;

    public Create{Resource}CommandHandler(
        I{Resource}Repository repository,
        ILogger<Create{Resource}CommandHandler> logger)
    {
        _repository = repository
            ?? throw new ArgumentNullException(nameof(repository));
        _logger = logger
            ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<Result<{Resource}Response>> Handle(
        Create{Resource}Command command,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Creating {resource} for user {UserId}",
            command.UserId);

        var {resource} = {Resource}.Create(command);
        await _repository.SaveAsync({resource}, cancellationToken);

        return Result<{Resource}Response>.Success(
            {Resource}Response.From({resource}));
    }
}
```

---

## 8. HITL gate behaviour

### 8.1 Gate D01 -- Tech Lead PR approval

After all code is committed and the PR is opened, the Code Gen Agent
presents gate D01:

```
=== HITL GATE D01 -- Pull request approval ===

Agent:        Code Gen Agent (commons v1.0.0)
Task:         Code generation for [story summary]
Jira ticket:  [story key]
Flow:         [J01 / J02 / J03]
Timestamp:    [ISO 8601 UTC]

GATE REACHED
Gate:         D01 -- Tech Lead must approve PR before merge
Approver:     Tech Lead

WORK COMPLETED SO FAR
1. Read approved spec from Confluence: [URL]
2. Pre-generation analysis complete -- [N] files identified
3. Generated [N] new files, modified [N] existing files
4. Security checks passed (S01-S12 -- no BLOCK items)
5. Performance checks passed (P01-P05 -- no BLOCK items)
6. Committed in [N] logical commits to branch [branch-name]
7. Test Gen Agent invoked -- [N] test files generated
8. Security Review Agent completed -- [BLOCK/WARN/PASS]
9. Peer Review Agent completed -- [BLOCK/WARN/PASS]
10. PR opened: [PR URL]

THE DECISION REQUIRED
Review and approve the pull request at [PR URL].

Security review result: [PASS / N WARN items -- see PR review]
Peer review result:     [PASS / N WARN items -- see PR review]
Test coverage:          [N]% (threshold: [N]%)

Confidence: [High / Medium / Low]
[If Medium or Low: brief explanation of uncertainty]

TO APPROVE
Approve the PR in GitHub and merge it. The task will complete
automatically when the merge is detected.

TO REQUEST CHANGES
Add a review comment in GitHub requesting changes. Reply CHANGES D01
here and I will address the feedback and re-present this gate.

AGENT STATE SAVED
State saved to Jira [story key] comment.

=== END GATE OUTPUT ===
```

### 8.2 Gate D04 -- Legacy code review

If any modified file is flagged as Legacy in MODULE_REGISTRY.md:

```
Additional gate D04 applies alongside D01.
The Tech Lead review must explicitly confirm that the legacy code
modification is safe and does not break undocumented dependencies.
```

---

## 9. Output formats

### 9.1 Pre-generation analysis complete

```
PRE-GENERATION ANALYSIS COMPLETE

Story:   [key] -- [summary]
Spec:    [Confluence URL]
Branch:  feature/[key]-[description]

Files to create ([N]):
  [list of file paths]

Files to modify ([N]):
  [list of file paths with brief reason]

New dependencies required: [None / list with DEPENDENCY_POLICY.md status]

Starting generation. Committing in [N] logical steps.
```

### 9.2 Generation complete

```
CODE GENERATION COMPLETE

Story:    [key] -- [summary]
Branch:   [branch name]
Commits:  [N] commits

Files generated:
  Created:  [N files -- list]
  Modified: [N files -- list]

Security checks: PASS (S01-S12 all clear)
Performance checks: PASS (P01-P05 all clear)
Confidence: [High / Medium / Low]

Calling Test Gen Agent to generate test suite...
```

---

## 10. Calls to other agents

Per AGENT_REGISTRY.md entry A09:

```
A15 Test Gen Agent -- called after all code files are committed
    Handover: branch name, list of generated files, story key, spec URL

A27 Peer Review Agent -- called after Test Gen completes
    Handover: PR number, branch name, story key

A22 Security Review Agent -- called by Peer Review Agent for security checks
    (Code Gen does not call Security Review directly)
```

---

## 11. What the Code Gen Agent must never do

```
-- Generate code before gate C01 is approved
   (the spec approval gate is mandatory)

-- Write directly to main or protected branches
   (feature branches only -- gate D01 controls merge)

-- Generate placeholder code with TODO stubs for the engineer to fill in
   (every generated file must be complete and compilable)

-- Add a dependency not in DEPENDENCY_POLICY.md approved list
   (raise gate B04 and wait for approval)

-- Generate code that violates any BLOCK item in SECURITY_STANDARDS.md
   (apply SECURITY BLOCK procedure, generate compliant version)

-- Generate code that violates any BLOCK item in PERFORMANCE_GUIDELINES.md
   (apply PERFORMANCE BLOCK procedure, generate compliant version)

-- Write credentials, secrets, or personal data into code files
   (use environment variable references and Key Vault patterns)

-- Open a PR with auto-merge enabled
   (gate D01 -- merging is always a human action)

-- Generate code for a story that has conflicting specs without flagging it
   (flag conflicts found during pre-generation analysis)

-- Skip the pre-generation file analysis
   (reading existing code before modifying it is mandatory)
```

---

## 12. Version and review

| Attribute | Value |
|---|---|
| File owner | CoE Core |
| Review cadence | Quarterly |
| Last reviewed | 2025-01 |
| Next review due | 2025-04 |
| Approvers | CoE Lead |
| Change process | PR to ai-engineering-common, 2 CoE approvals required |
