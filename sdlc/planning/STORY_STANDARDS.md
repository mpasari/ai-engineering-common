# STORY_STANDARDS.md
# SDLC -- Planning Stage -- Story Quality Standards
# Version: 1.0.0
# Status: Active
# Last updated: 2025-01
# Owner: CoE Core

---

## 1. Purpose

Defines what a well-formed story looks like before it is pulled into
a sprint. The Story Drafter Agent (A04) produces stories meeting these
standards. Human-authored stories must meet the same standards before
moving to Ready status.

---

## 2. Ready definition

A story is Ready when ALL of the following are true:

```
[ ] Summary is clear -- a reader unfamiliar with the feature understands
    what is being built from the summary alone
[ ] Acceptance criteria present -- at least one Given/When/Then AC
[ ] ACs are testable -- each Then clause describes a verifiable outcome
[ ] Dependencies documented -- blocked-by links set or "None"
[ ] Component set -- module from MODULE_REGISTRY.md
[ ] Estimated -- story points set (even if rough)
[ ] No open blocking questions -- all ambiguities resolved or documented
    as non-blocking for implementation
[ ] Epic linked -- story is linked to a parent epic
```

---

## 3. Acceptance criteria quality rules

### 3.1 Required structure

Every AC uses Given/When/Then format:

```
Given [precondition -- the state before the action]
When  [action -- what the user or system does]
Then  [expected outcome -- what must be true after the action]
```

### 3.2 Quality checklist per AC

```
Given clause:
  [ ] Is a specific, testable state (not vague like "Given the user is happy")
  [ ] Includes the user role if auth matters

When clause:
  [ ] Is a specific, observable action (not vague like "When something happens")
  [ ] Matches the implementation layer (API call, UI action, event)

Then clause:
  [ ] Is a verifiable outcome that a test can assert on
  [ ] Does not say just "Then it works" or "Then it succeeds"
  [ ] Covers one outcome per Then (not three outcomes in one Then)

Coverage:
  [ ] Happy path covered
  [ ] Main error case covered (validation failure, not found, forbidden)
  [ ] Auth/permission case covered (for endpoints requiring auth)
```

### 3.3 Story AC count guidance

| Story size | Minimum ACs | Maximum ACs |
|---|---|---|
| 1-2 points | 1 | 3 |
| 3-5 points | 2 | 5 |
| 5-8 points | 3 | 7 |
| > 8 points | Consider splitting | -- |

More than 7 ACs usually means the story is too large or ACs overlap.

---

## 4. Story anti-patterns

| Anti-pattern | Problem | Fix |
|---|---|---|
| "As a user, I want to manage orders" | Too vague -- what does manage mean? | Break into specific capabilities |
| Then clause: "Then it works" | Not testable | Specify the exact observable outcome |
| AC: "Given everything is set up" | Not a testable precondition | Specify the exact system state |
| 12 ACs in one story | Story is too large | Split into 2-3 stories |
| No error case AC | Happy path only | Add at minimum one validation error AC |
| Story with no component set | Agent cannot identify affected module | Set component from MODULE_REGISTRY.md |

---

## 5. Done definition

A story is Done when ALL of the following are true:

```
[ ] All ACs passed (Feature Validation Agent report shows all PASS)
[ ] Code reviewed and approved by Tech Lead (gate D01)
[ ] Security review passed (no BLOCK findings)
[ ] Accessibility review passed for UI stories (no BLOCK findings)
[ ] Tests passing in CI (all status checks green)
[ ] Coverage meets threshold (no gate D05 open)
[ ] Confluence spec updated to "Implemented" status
[ ] API documentation updated (if API changed)
[ ] CHANGELOG.md entry added (if user-facing feature)
[ ] Deployed to staging
```

---

## 6. Version and review

| File owner | CoE Core |
| Review cadence | Quarterly |
