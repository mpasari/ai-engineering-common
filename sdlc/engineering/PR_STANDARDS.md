# PR_STANDARDS.md
# SDLC -- Engineering Stage -- Pull Request Standards
# Version: 1.0.0
# Status: Active
# Last updated: 2025-01
# Owner: CoE Core
#
# This file is read by:
#   - Code Gen Agent (A09) -- PR description generation
#   - Peer Review Agent (A27) -- validates PR quality before review
#   - Release Agent (A28) -- extracts changelog entries

---

## 1. PR naming convention

```
{type}({scope}): {description} -- {JIRA-KEY}

Types: feat | fix | refactor | chore | test | docs | security | perf
Scope: module name from MODULE_REGISTRY.md (optional but recommended)

Examples:
  feat(orders-api): add order cancellation endpoint -- PROJ-412
  fix(orders-domain): prevent cancellation of shipped orders -- PROJ-500
  refactor(orders-infra): migrate RestTemplate to RestClient -- PROJ-445
  chore: update dependencies -- PROJ-451
```

---

## 2. PR description template

Every PR must have a description. Code Gen Agent uses this template
automatically. Human PRs must follow the same structure.

```markdown
## Summary
[2-3 sentences describing what this PR does and why]

## Jira story
[PROJ-NNN](https://telia-company.atlassian.net/browse/PROJ-NNN)

## Changes
- [Specific change 1]
- [Specific change 2]
- [Specific change 3]

## Test evidence
- Unit tests: [N] added / [N] modified
- Integration tests: [N] added
- AC validation: [PASS / Pending / N/A -- no ACs]
- Manual testing: [What was tested manually, if applicable]

## Security checklist
- [ ] No credentials in code
- [ ] Input validation on all user input
- [ ] Auth check present on all new endpoints
- [ ] No new dependencies outside DEPENDENCY_POLICY.md approved list

## Database changes
[Migration script: V{N}__description.sql / None]
[Rollback script available: Yes / No / N/A]
[Dry-run on test database: PASS / N/A]

## Rollback plan
[How to revert this change if issues are found after merge.
 Or: "Revert this PR" if no data migrations are involved.]

## Reviewer notes
[Anything the reviewer should pay special attention to, or
 areas of the code that are particularly tricky]
```

---

## 3. PR size guidelines

| Size | Lines changed | Review time | Guidance |
|---|---|---|---|
| Small | < 200 lines | < 30 min | Ideal |
| Medium | 200-500 lines | 30-60 min | Acceptable |
| Large | 500-1000 lines | 60-120 min | Split if possible |
| Extra large | > 1000 lines | > 2h | Must split |

For refactoring PRs covering multiple files in a single module,
up to 1000 lines is acceptable. For feature PRs, keep under 500 lines.

When a PR cannot be split further (e.g. a large migration), add to
the description: "This PR is large because [reason]. Key files to
review: [list the 2-3 most important files]."

---

## 4. Branch naming

```
feature/{JIRA-KEY}-{brief-description}
fix/{JIRA-KEY}-{brief-description}
refactor/{JIRA-KEY}-{module-name}-{brief}
chore/{JIRA-KEY}-{brief-description}
hotfix/{JIRA-KEY}-{brief-description}

Examples:
  feature/PROJ-412-order-cancellation
  fix/PROJ-500-prevent-shipped-cancellation
  refactor/PROJ-445-orders-infra-rest-client-migration
```

---

## 5. PR lifecycle

```
1. Engineer opens PR from feature branch to main
2. Peer Review Agent (A27) runs automatically:
   -- Security Review (A22) in parallel
   -- Secrets Scan (A25) in parallel
   -- Accessibility (A19) in parallel if UI code
3. Engineer addresses any BLOCK findings
4. Peer Review Agent confirms BLOCK findings resolved
5. Gate D01 presented to Tech Lead
6. Tech Lead approves in GitHub
7. PR merged (squash merge to main)
8. Branch deleted
```

Required status checks before merge:
- Build
- Unit tests
- Integration tests
- Security scan
- Lint
- Peer Review Agent (BLOCK findings = 0)

---

## 6. Commit messages in PRs

Per CODING_STANDARDS.md section 6.1. Each commit on a PR branch:

```
{type}({scope}): {description}

[Optional body explaining the why]

Jira: {PROJ-NNN}
Co-authored-by: AI Code Gen Agent <ai@telia-company.com>
```

Squash merge preserves only the PR title as the merge commit message.

---

## 7. Version and review

| File owner | CoE Core |
| Review cadence | Quarterly |
