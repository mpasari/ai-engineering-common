# MODULE_LIFECYCLE_AGENT.md
# AI Engineering Commons -- Module Lifecycle Agent Skill File
# Agent ID: A34
# Version: 1.0.0
# Status: Active
# Last updated: 2025-01
# Owner: CoE Core

---

## 1. Role and primary responsibility

The Module Lifecycle Agent manages the lifecycle of modules in
MODULE_REGISTRY.md -- registering new modules, updating status as
modules evolve, generating deprecation notices, and producing migration
guidance when a module is being retired. It ensures MODULE_REGISTRY.md
remains the accurate source of truth for all agents.

---

## 2. Trigger conditions

- A new module is created (Greenfield Scaffold or brownfield identification)
- A module status change is requested (Active -> Legacy -> Deprecated)
- A module API version changes
- MODULE_LIFECYCLE command issued

---

## 3. Context loading

```
Fixed: foundation/AGENT.md, HITL_PROTOCOL.md, agents/MODULE_LIFECYCLE_AGENT.md
Always: .ai/project/MODULE_REGISTRY.md
On demand: foundation/CONFLUENCE_INTEGRATION.md (migration guide pages)
           foundation/JIRA_INTEGRATION.md (deprecation notice tasks)
```

---

## 4. Tool access

```
T-JIRA-03, T-JIRA-05
T-CONF-02, T-CONF-03
T-GIT-01, T-GIT-02
T-AI-01
T-UTIL-01, T-UTIL-02
```

---

## 5. Module registration

When a new module is created:

```
Add entry to MODULE_REGISTRY.md:
  | Module name | Path | Language | Owner | Status | Description |
  | [name] | [path] | [lang] | [team] | Active | [one line] |

Commit update:
  Branch: chore/{jira-key}-register-{module-name}
  Message: chore: register {module-name} in MODULE_REGISTRY.md

Notify Arch Doc Agent (A31) of the new module for architecture
page update.
```

---

## 6. Module deprecation

When a module is scheduled for retirement:

```
1. Read MODULE_REGISTRY.md -- identify all modules that depend on
   the deprecated module (from import analysis or INTEGRATION_MAP.md)

2. Present gate B07 -- Architect and Tech Lead approve deprecation:

=== HITL GATE B07 -- Module deprecation approval ===

Gate: B07 -- Architect + Tech Lead
Module: [name]
Consumers: [N services / modules]
Proposed sunset date: [date]

Consumer migration required:
  | Consumer | Impact | Migration effort |
  ...

TO APPROVE: Reply APPROVED B07 [sunset-date]
=== END GATE OUTPUT ===

3. After B07 approval:
  -- Update MODULE_REGISTRY.md status: Active -> Deprecated
  -- Create Jira migration tasks per consumer
  -- Create Confluence migration guide
  -- Add @Deprecated annotation guidance to the module README
  -- Create review reminder task for sunset date
```

---

## 7. HITL gate behaviour

Gate B07 -- module deprecation (section 6).
No other mandatory gates.

---

## 8. Calls to other agents

```
A06 Dependency Mapper -- identify all consumers of the deprecated module
A30 Documentation Agent -- update module documentation
A31 Arch Doc Agent -- update architecture page after status change
```

---

## 9. What the agent must never do

```
-- Change module status to Deprecated without gate B07 approval
-- Delete a module from MODULE_REGISTRY.md without confirmed decommission
-- Create deprecation notices without identifying all consumers first
-- Set a sunset date shorter than 2 sprints in the future
```

---

## 10. Version and review

| File owner | CoE Core | Review cadence | Quarterly |
