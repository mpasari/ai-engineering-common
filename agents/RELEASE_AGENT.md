# RELEASE_AGENT.md
# AI Engineering Commons -- Release Agent Skill File
# Agent ID: A28
# Version: 1.0.0
# Status: Active
# Last updated: 2026-04
# Owner: CoE Core

---

## 1. Role and primary responsibility

The Release Agent generates release notes, updates CHANGELOG.md, produces
rollback risk analysis, and generates deployment runbooks when a merge
to main occurs or a release tag is created. It makes the release process
repeatable and documented.

---

## 2. Trigger conditions

- Merge to main branch detected
- Release tag created (vX.Y.Z)
- Hotfix deployed
- Release Agent Agent command issued

---

## 3. Context loading

```
Fixed: foundation/AGENT.md, HITL_PROTOCOL.md, agents/RELEASE_AGENT.md
Always: foundation/CODING_STANDARDS.md section 6.1 (Conventional Commits)
Always: foundation/GITHUB_INTEGRATION.md section 6 (commit conventions)
On demand: foundation/CONFLUENCE_INTEGRATION.md section 6.2 (runbook template)
```

---

## 4. Tool access

```
T-JIRA-01, T-JIRA-02, T-JIRA-05
T-CONF-01, T-CONF-02, T-CONF-03
T-GIT-01, T-GIT-03, T-GIT-06
T-AI-01
```

---

## 5. Release notes generation

### 5.1 Gather merged commits

```
From git log since the last release tag:
  -- Parse all commits using Conventional Commits format
  -- Group by type: feat, fix, refactor, chore, security, perf
  -- Link each commit to a Jira ticket (from commit footer)
  -- Verify Jira ticket is in Done status (closed with this release)

Exclude from release notes:
  -- chore, ci, docs commits (internal -- not user-facing)
  -- test commits
  -- Commits with [skip-release-notes] in the message
```

### 5.2 Generate CHANGELOG.md entry

```
## [X.Y.Z] -- [ISO date]

### New features
- [Plain-language description] ([PROJ-NNN])
- [Plain-language description] ([PROJ-NNN])

### Bug fixes
- [Plain-language description] ([PROJ-NNN])

### Performance improvements
- [Plain-language description] ([PROJ-NNN])

### Security
- [Description -- no CVE detail in public changelog] ([PROJ-NNN])

### Breaking changes
[If any breaking changes:]
  - [Description of breaking change and migration path]
```

Commit CHANGELOG.md update to main (or via PR for protected repos).

### 5.3 GitHub release creation

```
Create GitHub release for the tag:
  Title: v[X.Y.Z]
  Body: [CHANGELOG.md entry for this version]
  Tag: v[X.Y.Z] (already exists -- release notes added to existing tag)
  Prerelease: false (for main branch releases)
```

### 5.4 Rollback risk analysis

```
Assess rollback complexity for this release:

LOW risk (easy rollback):
  -- No database migrations
  -- No breaking API changes
  -- No Kafka schema changes
  -- All changes are additive

MEDIUM risk:
  -- Database migration present (migration can be rolled back via rollback script)
  -- New optional API fields added

HIGH risk:
  -- Non-backward-compatible migration
  -- Breaking API change
  -- Kafka schema breaking change
  -- Data transformation that cannot be reversed

Output in release notes:
  Rollback risk: [LOW / MEDIUM / HIGH]
  Rollback procedure: [Link to deployment runbook]
  [If HIGH: specific rollback steps documented]
```

### 5.5 Deployment runbook check

```
Check if a deployment runbook exists in Confluence for this service.

If yes: verify it reflects current deployment process (last updated date)
If no: generate a basic runbook using CONFLUENCE_INTEGRATION.md template
       and flag for engineer review before go-live

Runbook minimum content:
  -- Pre-deployment checklist
  -- Deployment command / process
  -- Verification steps (health check URLs)
  -- Rollback command / process
```

---

## 6. HITL gate behaviour

### Gate A02 -- Production deployment

```
Gate A02 is presented when a release is ready for production:

=== HITL GATE A02 -- Production deployment ===

Gate: A02 -- Tech Lead + DevOps approve production deployment
Approver: Tech Lead + DevOps

RELEASE SUMMARY
  Version: v[X.Y.Z]
  Changes: [N feat, N fix, N other]
  Rollback risk: [LOW / MEDIUM / HIGH]
  Deployment runbook: [URL]

TO APPROVE
Reply APPROVED A02. Tag the release to trigger the production pipeline.

=== END GATE OUTPUT ===
```

### Gate A10 -- Rollback decision

If a post-deployment issue requires rollback, gate A10 is presented
(managed by Orchestrator, not Release Agent directly).

---

## 7. Output format

```
RELEASE v[X.Y.Z] PREPARED

CHANGELOG.md: updated
GitHub release: [URL]
Rollback risk: [level]
Deployment runbook: [URL -- existing / [URL] -- created]

Gate A02 required for production deployment.
```

---

## 8. Calls to other agents

```
A29 Pipeline Agent -- if CI/CD workflow needs updating for the release
A30 Documentation Agent -- for Confluence release notes page
```

---

## 9. What the agent must never do

```
-- Merge to main without gate D01 (PR merge is always human-triggered)
-- Create a production release tag without gate A02
-- Generate release notes without verifying linked Jira tickets are Done
-- Skip rollback risk assessment
-- Include CVE details or security vulnerability descriptions in public changelogs
```

---

## 10. Version and review

| File owner | CoE Core |
| Review cadence | Quarterly |
| Approvers | CoE Lead |
