# CAPACITY_PLANNING.md
# SDLC -- Planning Stage -- Capacity Planning Guide
# Version: 1.0.0
# Status: Active
# Last updated: 2026-04
# Owner: CoE Core

---

## 1. Purpose

This guide defines how teams calculate sprint capacity, apply velocity
history, and communicate capacity constraints to the Planning Agent
and Estimation Agent. Consistent capacity planning prevents systematic
over-commitment.

---

## 2. Capacity calculation

### 2.1 Team capacity per sprint

```
Available engineering days =
  (engineers on team) x (sprint working days)
  - planned leave days
  - ceremony overhead (20% default)

Example:
  5 engineers x 10 working days = 50 days
  - 5 leave days = 45 days
  - 20% ceremonies (standup, planning, review, retro) = -9 days
  = 36 available engineering days

Story points per day (team average):
  Calculated from velocity: total points / total working days in last 3 sprints
  Example: 90 points over 30 days = 3 points/day

Sprint capacity:
  36 days x 3 points/day = 108 points available
  Recommended commitment: 80% of capacity = 86 points
```

### 2.2 The 80% rule

Never commit 100% of capacity. Reserve 20% for:
- Unplanned bug fixes (production issues interrupt sprint work)
- Story carry-over from previous sprint
- Tech debt discovered during implementation
- On-call engineer time (if team is on rotation)

The Planning Agent applies 80% automatically when generating sprint plans.

### 2.3 Capacity modifiers

Apply these before finalising sprint commitment:

| Condition | Modifier |
|---|---|
| New engineer joining (first sprint) | -20% of their capacity |
| On-call rotation active | -1 day per on-call engineer |
| Major release in sprint | -10% team overhead |
| External audit or compliance review | -as agreed with DM |
| Brownfield discovery sprint | -30% (high context-switching) |

---

## 3. Velocity tracking

### 3.1 What counts as velocity

Count only stories that are fully Done (code merged, tests passing,
deployed to staging, AC verified). Do not count:

- Stories in In Review (not yet Done)
- Stories carried over (count in the sprint they complete)
- Spikes or research tasks that do not produce shippable code
- Infrastructure stories if they have no engineering story points

### 3.2 Rolling average

Use a 3-sprint rolling average, not all-time average. Team composition,
tech stack, and sprint length changes make older data unreliable.

```
3-sprint rolling average:
  Sprint N-2: 78 points
  Sprint N-1: 85 points
  Sprint N:   90 points
  Average:    84 points
  80% target: 67 points for next sprint
```

### 3.3 When to reset velocity baseline

Reset the 3-sprint window when:
- Team size changes by 20% or more
- Sprint length changes
- Major tech stack change (e.g. migrating from one framework to another)
- Team takes on a new product area requiring learning curve

Signal the reset to the Planning Agent:
```
REQUEST_SPRINT_PLAN --reset-velocity-baseline
```

---

## 4. Communicating capacity to agents

Enter team capacity in the Jira sprint description before the
Planning Agent generates the sprint plan:

```
Sprint capacity: [N] points
Team: [N] engineers ([N] FTE adjusted for leave)
On-call: [Yes -- [engineer role] / No]
Notes: [Any capacity constraints for this sprint]
```

The Planning Agent reads this field automatically. If not set, it
calculates from velocity history.

---

## 5. Capacity anti-patterns

| Anti-pattern | Why it fails | Better approach |
|---|---|---|
| Committing 100% of capacity | No buffer for unplanned work -- leads to carry-over | Apply 80% rule |
| Including spike estimates in velocity | Spikes inflate velocity falsely | Track spikes separately |
| Ignoring leave when planning | Over-commitment causes rushing | Always subtract leave days |
| Planning to last day of sprint | No time for code review delays | End coding by Day 8 of 10 |
| Splitting a story across sprints | Stories should be completable in one sprint | Split before sprint start |

---

## 6. Version and review

| File owner | CoE Core |
| Review cadence | Quarterly |
| Approvers | CoE Lead |
