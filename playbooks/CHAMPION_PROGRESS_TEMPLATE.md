# Champion Progress — [CHAMPION NAME] · [TEAM NAME]

**Champion:** [Your name]
**Team:** [Team name]
**Unit:** [L5 unit]
**Repository:** [GitHub repo URL]
**Started:** [Date OT-1 completed]
**Last updated:** [Date]
**Status:** 🟡 In Progress / 🟢 Sprint 1 Complete / 🔵 Measuring

---

## Team Setup

| Role | Name |
|---|---|
| Tech Lead | [Name] |
| Product Owner | [Name] |
| CoE Champion | [Name] |
| Developers | [Names] |

**Jira project:** [PROJECT-KEY]
**Confluence space:** [SPACE-KEY]
**Active modules:** [N] found in brownfield scan

---

## One-Time Tasks Progress

| Task | Owner | Status | Completed | Notes |
|---|---|---|---|---|
| OT-1: Configure JIRA_CONFIG.md | Tech Lead | ✅ Done | [Date] | |
| OT-2: Brownfield scan | Tech Lead | ✅ Done | [Date] | [N] modules scanned |
| OT-2: DEEP analysis all Active modules | Tech Lead | ✅ Done | [Date] | [N] modules analysed |
| OT-2: .ai/project/ files verified | Tech Lead | ✅ Done | [Date] | |
| OT-2: /create-tech-debt-stories | Tech Lead | 🟡 In Progress | | [N] stories pending Gate C01 |
| OT-3: Team norms agreed | Full team | | | |
| OT-4: DoD updated | Tech Lead | | | |

---

## Brownfield Scan Findings

**Scan date:** [Date]
**Modules found:** [N total] ([N] Active, [N] Legacy, [N] Deprecated)

### Surprises from the scan

*What did the AI surface that the team did not already know?*

1. [Finding 1 -- e.g. "Shared database table between 2 modules with no documented owner"]
2. [Finding 2]
3. [Finding 3]

### DEEP Analysis Summary

| Module | Risk | Critical | High | Medium | Key finding |
|---|---|---|---|---|---|
| [module-name] | 🔴 Critical | [N] | [N] | [N] | [One sentence] |
| [module-name] | 🟠 High | [N] | [N] | [N] | [One sentence] |
| [module-name] | 🟡 Medium | [N] | [N] | [N] | [One sentence] |

### Tech debt stories created

| TD | Summary | Severity | Jira story | Sprint target |
|---|---|---|---|---|
| TD-001 | [description] | Critical | [NOCT-XXXX] | [Sprint N] |
| TD-002 | [description] | High | [NOCT-XXXX] | [Sprint N] |

---

## Sprint 1 — Stories Run Through the Recipe

| Story | /write-spec | Gate C01 | /generate-code | /review-pr | PR merged |
|---|---|---|---|---|---|
| [NOCT-XXX] [title] | ✅ | ✅ [date] | ✅ | ✅ | ✅ [date] |
| [NOCT-XXX] [title] | ✅ | 🟡 Pending | | | |

### Gate C01 Findings — Sprint 1

*For each story where Gate C01 surfaced something not in the original ticket:*

**Story: [NOCT-XXX]**
Finding: [What the AI found]
Was this known? [Yes / No / Partially]
Did it change the implementation? [Yes / No -- explain briefly]

**Story: [NOCT-XXX]**
Finding: [What the AI found]
Was this known? [Yes / No / Partially]
Did it change the implementation? [Yes / No -- explain briefly]

---

## Sprint 1 Retrospective — AI Engineering Questions

**1. Gate C01 value**
Which stories had Gate C01 findings not in the original ticket?
> [Your answer]

What was the most valuable finding?
> [Your answer]

**2. Code generation quality**
Did any /generate-code output require significant manual correction?
> [Your answer]

If yes -- what was missing from the spec or .ai/project/ files?
> [Your answer]

**3. Context accuracy**
Is MODULE_REGISTRY.md still accurate after this sprint?
> [Your answer]

Any .ai/project/ files that need updating?
> [Your answer]

---

## Metrics

### Gate C01 Finding Rate

| Sprint | Stories with /write-spec | Stories with Gate C01 findings | Finding rate |
|---|---|---|---|
| Sprint 1 | [N] | [N] | [N]% |
| Sprint 2 | | | |
| Sprint 3 | | | |

**Target:** >50% by sprint 2

### PR Review Cycle Time

| Sprint | Baseline (days avg) | With /review-pr (days avg) | Change |
|---|---|---|---|
| Sprint 1 (baseline) | [N] | [N] | [%] |
| Sprint 2 | | | |
| Sprint 3 | | | Target: -20% |

### Story Point Accuracy

| Sprint | Estimated total | Actual total | Accuracy |
|---|---|---|---|
| Sprint 1 (baseline) | [N] | [N] | [%] |
| Sprint 2 | | | |
| Sprint 3 | | | |

---

## What Is Working Well

*Fill in after each sprint. Be specific -- name the command, the story, the finding.*

**Sprint 1:**
-
-
-

**Sprint 2:**
-

---

## What Is Not Working

*Problems, gaps, confusing steps, commands that did not behave as expected.*

**Sprint 1:**

| Problem | When it happened | What we tried | Resolved? |
|---|---|---|---|
| [problem] | [context] | [action] | [Yes/No/Workaround] |

---

## Suggestions for the Recipe

*Things you think should be added, changed, or removed from SPRINT_INTEGRATION_RECIPE.md.*

| Suggestion | Why | Priority |
|---|---|---|
| [suggestion] | [reason] | High / Medium / Low |

---

## Questions for CoE

*Questions that came up during setup or the first sprint that the recipe did not answer.*

1. [Question]
2. [Question]

Post these in the **AI Champions CoE Teams channel** for a faster response.

---

## People Onboarded

*Track everyone on the team who has been introduced to the AI Engineering Commons workflow.*

| Name | Role | Introduced | First story | Notes |
|---|---|---|---|---|
| [Name] | Developer | [Date] | [NOCT-XXX] | |
| [Name] | Product Owner | [Date] | Ran /write-spec | |

---

## Version

| Field | Value |
|---|---|
| Template version | 1.0 |
| Commons version | [Run: npx aec version] |
| Recipe version | SPRINT_INTEGRATION_RECIPE.md v1.0 |
| Page owner | [Champion name] |
| Review cadence | After each sprint |
