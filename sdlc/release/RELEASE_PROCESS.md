# RELEASE_PROCESS.md
# SDLC -- Release Stage -- Release Process Guide
# Version: 1.0.0
# Status: Active
# Last updated: 2026-04
# Owner: CoE Core
#
# This file is read by:
#   - Release Agent (A28) -- release notes and CHANGELOG generation
#   - Pipeline Agent (A29) -- deployment pipeline context

---

## 1. Release types

| Type | Trigger | Gate required | Deploy target |
|---|---|---|---|
| Feature release | Sprint end + PI milestone | Gate A02 | All environments |
| Hotfix | P0/P1 incident fix | Gate A02 (expedited) | Production only |
| Patch | Minor bug fix or security patch | Gate A02 | All environments |
| Release candidate | Pre-PI milestone | No gate -- staging only | Staging only |

---

## 2. Semantic versioning

All services follow Semantic Versioning (SemVer):

```
vMAJOR.MINOR.PATCH

MAJOR: Breaking API or event schema change (requires consumer migration)
MINOR: New feature, backward compatible
PATCH: Bug fix or security patch, no new features

Examples:
  v1.0.0  -- initial production release
  v1.1.0  -- new cancellation feature added
  v1.1.1  -- fix for cancellation edge case
  v2.0.0  -- API v2 with breaking changes
```

Major version increments require:
- All API consumers updated or backward compatibility maintained
- Advance notice to consumer teams (minimum 1 sprint)
- Architecture Doc Agent updates ADR for the breaking change

---

## 3. Release checklist

Before requesting gate A02:

```
Engineering:
  [ ] All stories in release are in Done status
  [ ] All CI pipeline checks pass on main
  [ ] Security scan -- zero Critical/High CVEs unfixed
  [ ] Secrets scan -- zero findings
  [ ] CHANGELOG.md updated (Release Agent does this)
  [ ] Release notes generated (Release Agent does this)

QA:
  [ ] All ACs passed (Feature Validation Agent report)
  [ ] Performance test passed against SLO targets
  [ ] Accessibility scan passed (zero BLOCK findings)
  [ ] Smoke tests passed on staging

Documentation:
  [ ] Confluence spec updated to "Implemented"
  [ ] API documentation updated (if API changed)
  [ ] Architecture docs updated (if architecture changed)
  [ ] Runbook updated (if operational procedure changed)

Deployment:
  [ ] Deployment runbook current
  [ ] Database migration dry-run passed (if migration included)
  [ ] Rollback plan documented
  [ ] On-call engineer notified of upcoming release
```

---

## 4. Release process -- step by step

```
Step 1: Merge all release stories to main
  All feature branches merged via gate D01 approved PRs

Step 2: Run Release Agent
  Command: (automatic on push to main, or manual via Release Agent)
  Output: CHANGELOG.md updated, GitHub release notes prepared

Step 3: Tag the release candidate
  git tag v1.1.0-rc.1
  git push origin v1.1.0-rc.1
  --> Triggers staging deployment automatically

Step 4: Verify on staging
  Run smoke tests
  Run performance baseline test
  Check Grafana dashboard -- all signals green after 15 minutes

Step 5: Request gate A02
  Tech Lead + DevOps approve production deployment

Step 6: Tag the production release
  git tag v1.1.0
  git push origin v1.1.0
  --> Triggers production deployment pipeline

Step 7: Verify on production
  Monitor Grafana for 30 minutes post-deploy
  SRE Agent monitors automatically
  If any SLO breach: escalate to Tier 3 or initiate DECLARE_INCIDENT

Step 8: Publish release
  GitHub release published (from Release Agent draft)
  Stakeholder notification (from Stakeholder Report Agent)
```

---

## 5. Hotfix process

For P0/P1 production incidents requiring an emergency fix:

```
Step 1: Create hotfix branch from production tag
  git checkout -b hotfix/PROJ-INC-001 v1.1.0

Step 2: Implement fix (Code Gen or manual)
  Expedited peer review -- BLOCK findings only (no WARN review)

Step 3: Expedited gate A02
  Tech Lead approves via Jira comment -- no waiting for meeting

Step 4: Deploy directly to production
  Skip staging deployment if incident is critical
  Monitor immediately after deployment

Step 5: Backport to main
  Cherry-pick the fix to main
  Increment PATCH version: v1.1.1
```

---

## 6. Version and review

| File owner | CoE Core |
| Review cadence | Quarterly |
