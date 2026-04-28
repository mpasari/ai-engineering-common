# HITL_PROTOCOL.md

# AI Engineering Commons -- Human-in-the-Loop Protocol

# Version: 1.0.0

# Status: Active

# Last updated: 2026-04

# Owner: CoE Core

---

## 1. Purpose

This file defines exactly when every agent in the ai-engineering-commons
system must stop and wait for human approval before proceeding. It defines
the format of that stop, what information the agent must present, how the
human approves or rejects, and how the agent resumes.

AGENT.md section 4.1 makes HITL gates absolute -- they cannot be bypassed
by any task instruction, user request, or agent decision. This file gives
those gates their operational definition.

Every agent skill file references this file and lists the specific HITL
gates that apply to that agent's tasks. When an agent reaches a gate, the
behaviour defined in section 3 of this file applies universally.

---

## 2. HITL gate categories

There are five categories of HITL gate. Every gate in the system belongs
to exactly one category. The category determines the urgency, the required
approver, and the consequence of rejection.

### Category A -- Production safety gates

These gates exist because the action is irreversible or directly affects
live systems and real users. No agent may proceed past a Category A gate
without explicit human approval.


| Gate ID | Trigger                                             | Required approver            |
| ------- | --------------------------------------------------- | ---------------------------- |
| A01     | Any merge to main or release branch                 | Tech Lead                    |
| A02     | Any deployment to production environment            | Tech Lead + DevOps           |
| A03     | Any database migration on production                | Tech Lead + DBA              |
| A04     | Any change to security configuration in production  | Security Lead                |
| A05     | Any deletion of data in production                  | Tech Lead + Data Owner       |
| A06     | Any change to authentication or authorisation rules | Security Lead                |
| A07     | SRE Agent Tier 2 action notification                | On-call Engineer             |
| A08     | SRE Agent Tier 3 escalation                         | On-call Engineer + Tech Lead |
| A09     | SRE Agent Tier 4 war room activation                | Tech Lead + SRE Lead         |
| A10     | Any rollback decision in production                 | Tech Lead                    |


### Category B -- Architectural decision gates

These gates exist because the decision shapes how the system is built
and is expensive to reverse. The agent presents options and evidence;
the human makes the decision.


| Gate ID | Trigger                                                | Required approver         |
| ------- | ------------------------------------------------------ | ------------------------- |
| B01     | New service or module creation                         | Architect                 |
| B02     | New external integration introduction                  | Architect + Tech Lead     |
| B03     | API version bump (breaking change)                     | Architect + Tech Lead     |
| B04     | New dependency not in approved list                    | Security Lead + Tech Lead |
| B05     | Architecture Decision Record (ADR) finalisation        | Architect                 |
| B06     | Change to event schema that is not backward compatible | Architect + Tech Lead     |
| B07     | Module deprecation decision                            | Architect + Tech Lead     |
| B08     | Data model change affecting multiple services          | Architect                 |


### Category C -- Specification approval gates

These gates exist at the boundary between planning and execution. The
agent generates the artefact; the human confirms it is correct before
any code is written.


| Gate ID | Trigger                                      | Required approver   |
| ------- | -------------------------------------------- | ------------------- |
| C01     | Technical spec ready for review              | Tech Lead           |
| C02     | Acceptance criteria generated from story     | BA or Product Owner |
| C03     | API contract draft ready for partner review  | Tech Lead + Partner |
| C04     | Data migration plan ready for review         | Tech Lead + DBA     |
| C05     | Security spec section ready for review       | Security Lead       |
| C06     | Epic-level spec ready for PI planning review | Architect + DM      |
| C07     | Test strategy for a new feature area         | Tech Lead + QA Lead |


### Category D -- Code review and merge gates

These gates exist to ensure human oversight of all code that enters
the main branch. The Peer Review Agent assists but does not replace
human review.


| Gate ID | Trigger                                           | Required approver     |
| ------- | ------------------------------------------------- | --------------------- |
| D01     | Pull request ready for merge (after agent review) | Tech Lead             |
| D02     | Security Review Agent finds a BLOCK item          | Security Lead         |
| D03     | Refactor Agent completes a multi-file refactor    | Tech Lead             |
| D04     | Legacy code modified by any agent                 | Tech Lead             |
| D05     | Test coverage drops below defined threshold       | Tech Lead + QA Lead   |
| D06     | New public API endpoint added                     | Tech Lead + Architect |


### Category E -- Operational and compliance gates

These gates exist to ensure humans retain accountability for operational
and regulatory decisions.


| Gate ID | Trigger                                   | Required approver        |
| ------- | ----------------------------------------- | ------------------------ |
| E01     | Known error accepted with no fix decision | Tech Lead + SRE Lead     |
| E02     | Known error deferred to future sprint     | Tech Lead                |
| E03     | Problem record root cause confirmed       | Tech Lead                |
| E04     | Incident severity declared (P0/P1)        | Tech Lead + SRE Lead     |
| E05     | Post-mortem action items approved         | Tech Lead + DM           |
| E06     | Compliance exception request              | Security Lead + Legal    |
| E07     | New data processing activity introduced   | DPO or Security Lead     |
| E08     | External audit evidence package approved  | Security Lead + CoE Lead |
| E09     | CVE remediation plan approved             | Security Lead            |
| E10     | SRE autonomy budget change                | SRE Lead + Tech Lead     |


---

## 3. Standard HITL gate behaviour

When any agent reaches a HITL gate, it must follow this exact sequence
regardless of gate category, task type, or agent identity.

### 3.1 Step 1 -- Stop immediately

The agent stops all processing. It does not attempt to proceed past the
gate. It does not make assumptions about what the human would decide. It
does not perform the gated action speculatively and then seek approval
after the fact.

### 3.2 Step 2 -- Produce the gate output

The agent produces a structured output in the following format. Every
field is mandatory. Agents must not skip fields or substitute prose
for the structured format.

```
=== HITL GATE [Gate ID] -- [Gate category name] ===

Agent:        [Agent name] (commons v[version])
Task:         [One-line description of the current task]
Jira ticket:  [Ticket number or "none"]
Flow:         [Journey flow ID e.g. J03, or "none"]
Timestamp:    [ISO 8601 UTC]

GATE REACHED
Gate:         [Gate ID] -- [Gate description from section 2]
Approver:     [Required approver role(s) from section 2]

WORK COMPLETED SO FAR
[Numbered list of actions taken before reaching the gate.
 Be specific -- include file names, ticket numbers, URLs.]

THE DECISION REQUIRED
[One clear question or decision the human must make.
 If there are options, list them explicitly.]

OPTIONS (if applicable)
  Option A: [Description] -- [Consequence]
  Option B: [Description] -- [Consequence]
  Option C: [Description] -- [Consequence]

AGENT RECOMMENDATION (if applicable)
[The agent's recommended option and the reason. This is advisory only.]

TO APPROVE
[Exact instruction for what the human must say or do to approve.
 Example: "Reply APPROVED to continue with Option A"
 Example: "Merge the PR to trigger continuation"
 Example: "Update the Jira ticket status to In Review"]

TO REJECT OR REQUEST CHANGES
[What the human must say or do to reject or request changes.
 Example: "Reply REJECTED with your reasoning"
 Example: "Add a comment to the PR describing required changes"]

AGENT STATE SAVED
[Reference to where the agent's current state is stored so the task
 can be resumed. Example: "State saved to Jira ticket PROJ-412 comment"
 or "State summarised below for handover"]

=== END GATE OUTPUT ===
```

### 3.3 Step 3 -- Save state

Before waiting, the agent writes a state summary to the relevant Jira
ticket as a comment. The state summary must contain enough information
for the task to be resumed by any agent instance, not just the current
one. See `AGENT_HANDOVER.md` for the state summary format.

### 3.4 Step 4 -- Wait

The agent waits. It does not poll, retry, or attempt to infer approval
from indirect signals. It does not proceed if a timeout elapses.

If a gate has been waiting longer than the timeout defined for its
category (section 4), the agent creates an escalation notification
but still does not proceed autonomously.

### 3.5 Step 5 -- Resume on approval

When the human provides the approval signal defined in the gate output:

1. The agent confirms it received the approval:
  ```
   GATE [Gate ID] APPROVED by [Approver name/role] at [timestamp]
   Resuming task: [task description]
  ```
2. The agent logs the approval: gate ID, approver, timestamp, decision.
  This log entry is the audit trail for the gated action.
3. The agent resumes from the saved state and continues the task.

### 3.6 Step 6 -- Handle rejection

When the human rejects or requests changes:

1. The agent confirms receipt:
  ```
   GATE [Gate ID] REJECTED by [Approver name/role] at [timestamp]
   Reason: [Approver's stated reason]
  ```
2. If changes are requested, the agent incorporates the feedback and
  produces updated work, then presents it at the same gate again.
3. If the task is fully rejected, the agent updates the Jira ticket
  with the rejection reason and closes the task cleanly. It does not
   retry the gated action.

---

## 4. Gate timeouts and escalation

### 4.1 Timeout by category


| Category               | Description               | Wait timeout                      | Escalation action              |
| ---------------------- | ------------------------- | --------------------------------- | ------------------------------ |
| A -- Production safety | Irreversible, live system | 30 minutes                        | Page on-call engineer          |
| B -- Architectural     | Design decision           | 2 business days                   | Notify Tech Lead and Architect |
| C -- Specification     | Spec approval             | 1 business day                    | Notify DM and Tech Lead        |
| D -- Code review       | PR approval               | 1 business day                    | Notify Tech Lead               |
| E -- Operational       | Compliance decision       | 4 hours (P0/P1) or 1 business day | Notify SRE Lead or DM          |


### 4.2 Escalation format

When a timeout elapses, the agent sends an escalation notification:

```
GATE TIMEOUT ESCALATION

Gate:        [Gate ID] -- [Gate description]
Waiting for: [Required approver role]
Waiting since: [ISO 8601 timestamp when gate was reached]
Task:        [Task description]
Jira ticket: [Ticket number]

This gate has been waiting beyond the defined timeout.
The task cannot proceed without approval.

Action required: Please review and approve or reject at [Jira ticket URL]
```

The escalation is sent to:

- The required approver's notification channel
- The Delivery Manager for the team
- The CoE Slack channel (#ai-engineering-commons)

---

## 5. HITL gate exemptions

There are no full exemptions from HITL gates. However, the following
conditions reduce friction for routine approvals:

### 5.1 Pre-approved patterns

When a Tech Lead has pre-approved a specific pattern for routine use
in a project, they document it in the project's `.ai/project/` folder
as a pre-approval. The agent recognises the pre-approval and notes it
in the gate output, but still presents the gate output for awareness.

Example: A Tech Lead pre-approves the standard repository pattern for
all new services. When the Code Gen Agent creates a new repository class,
it notes the pre-approval and the gate becomes informational rather than
a hard stop.

Pre-approvals must be:

- Documented in `.ai/project/PREAPPROVALS.md`
- Signed by the Tech Lead
- Reviewed quarterly
- Specific -- "approve all uses of pattern X" not "approve all code"

### 5.2 Batch approval

For tasks that generate many similar artefacts (e.g. generating 10 Jira
stories from an epic), the agent presents all artefacts at once at a
single gate rather than one gate per artefact. The human approves the
batch or provides feedback on specific items.

### 5.3 SRE Agent Tier 1 -- no gate

SRE Agent Tier 1 (silent self-heal) actions defined in
`sdlc/ops/SRE_AUTONOMY_BUDGET.md` do not require a HITL gate before
action. They do require a log entry after action (gate A07 applies
as a notification, not a pre-action gate). This is the only category
of agent action that proceeds without prior human approval.

---

## 6. HITL gate log format

Every gate interaction -- approval, rejection, timeout, escalation --
is logged. The log is stored in the centralised audit system as defined
in `COMPLIANCE_STANDARDS.md` section 4.

```json
{
  "timestamp": "2025-01-15T10:30:00Z",
  "gateId": "C01",
  "gateCategory": "C",
  "agentId": "SPEC_WRITER_AGENT",
  "commonsVersion": "1.0.0",
  "jiraTicket": "PROJ-412",
  "journeyFlow": "J03",
  "outcome": "APPROVED",
  "approverRole": "Tech Lead",
  "approverName": "[recorded at approval time]",
  "waitDurationSeconds": 3420,
  "taskDescription": "Technical spec for order cancellation feature"
}
```

Fields that must never be logged:

- Content of the spec, code, or artefact under review
- Personal data of any kind
- Credentials or secrets

---

## 7. Journey flow gate maps

Each journey flow has a defined sequence of HITL gates. Agents use
these maps to know which gates apply to the current task. The full
gate sequence per flow is documented in the journey flow files, but
the standard gates for the most common flows are:


| Flow                     | Key HITL gates in sequence                                      |
| ------------------------ | --------------------------------------------------------------- |
| J01 Bug fix              | D01 (PR merge)                                                  |
| J02 Change request       | C01 (spec), D01 (PR merge)                                      |
| J03 New feature          | C01 (spec), C02 (ACs), D01 (PR merge)                           |
| J04 New epic             | B01 (new service if applicable), C06 (epic spec), D01 per story |
| J05 New integration      | B02 (integration), C03 (contract), D01 (PR merge)               |
| J06 Performance issue    | D01 (fix PR merge)                                              |
| J07 Vulnerability scan   | E09 (remediation plan), D01 (patch PR merge)                    |
| J08 Library upgrade      | D01 per module PR                                               |
| J09 Integration changed  | C03 (updated contract), D01 (PR merge)                          |
| J10 Greenfield kickoff   | B01 (service creation), B05 (ADRs), C06 (initial spec)          |
| J11 Brownfield discovery | C01 (discovery spec review)                                     |
| J12 Production incident  | E04 (severity), A09 if Tier 4, E05 (post-mortem)                |
| J13 Data migration       | C04 (migration plan), A03 (production migration)                |
| J14 Engineer onboarding  | None -- informational flow only                                 |
| J15 Problem management   | E01 or E02 (fix decision), E03 (root cause)                     |


---

## 8. Relationship to other files


| File                              | Relationship                                           |
| --------------------------------- | ------------------------------------------------------ |
| `AGENT.md`                        | Section 4.1 makes this file's gates absolute           |
| `AGENT_HANDOVER.md`               | State saving format used at every gate                 |
| `MULTI_AGENT_SETUP.md`            | Gate routing between agents                            |
| `sdlc/ops/SRE_AUTONOMY_BUDGET.md` | Defines Tier 1 actions exempt from pre-action gates    |
| `COMPLIANCE_STANDARDS.md`         | Gate log retention and audit requirements              |
| All agent skill files             | Each lists the specific gates that apply to that agent |


---

## 9. Version and review


| Attribute       | Value                                                 |
| --------------- | ----------------------------------------------------- |
| File owner      | CoE Core                                              |
| Review cadence  | Quarterly                                             |
| Last reviewed   | 2026-04                                               |
| Next review due | 2026-04                                               |
| Approvers       | CoE Lead, SRE Lead, Security Lead                     |
| Change process  | PR to ai-engineering-common, 2 CoE approvals required |


