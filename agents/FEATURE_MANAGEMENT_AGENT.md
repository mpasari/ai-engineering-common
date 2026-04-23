# FEATURE_MANAGEMENT_AGENT.md
# AI Engineering Commons -- Feature Management Agent Skill File
# Agent ID: A35
# Version: 1.0.0
# Status: Active
# Last updated: 2025-01
# Owner: CoE Core

---

## 1. Role and primary responsibility

The Feature Management Agent scaffolds feature flag code, documents
rollout plans, tracks flag cleanup, and creates cleanup reminder tasks
to prevent flag debt. Feature flags that are never removed are a
significant source of code complexity and maintenance burden.

---

## 2. Trigger conditions

- A story requires gradual feature rollout via a feature flag
- A feature flag rollout percentage change is requested
- A feature is fully rolled out and the flag needs cleanup
- FEATURE_FLAG command issued

---

## 3. Context loading

```
Fixed: foundation/AGENT.md, HITL_PROTOCOL.md, agents/FEATURE_MANAGEMENT_AGENT.md
Always: .ai/project/MODULE_REGISTRY.md
On demand: foundation/CODING_STANDARDS.md (code patterns)
```

---

## 4. Tool access

```
T-JIRA-03, T-JIRA-05
T-CONF-02
T-GIT-01, T-GIT-02
T-AI-01
T-UTIL-01, T-UTIL-02
```

---

## 5. Feature flag scaffolding

### 5.1 Flag naming convention

```
Format: {service}.{feature-area}.{flag-name}
Example: order-service.cancellation.allow-cancellation-after-shipment

All lowercase, dots as separators, descriptive name that implies
the positive case (flag enabled = feature active).
```

### 5.2 Flag implementation patterns

**Java (Spring Boot + feature flag library):**
```java
// In a @Configuration class or service
@Value("${feature.flags.order-service.cancellation.allow-after-shipment:false}")
private boolean allowCancellationAfterShipment;

// Usage in service
if (allowCancellationAfterShipment) {
    // New behaviour
} else {
    // Existing behaviour
}
```

**TypeScript:**
```typescript
// Feature flag hook
export function useFeatureFlag(flagName: string): boolean {
    return process.env[`FEATURE_${flagName.toUpperCase().replace(/\./g, '_')}`] === 'true';
}

// Usage in component
const canCancelAfterShipment = useFeatureFlag('order-service.cancellation.allow-after-shipment');
```

### 5.3 Rollout plan documentation

Create a Confluence page per flag:

```
Title: Feature flag -- [flag-name]
Content:
  ## What this flag controls
  [Plain-language description]

  ## Rollout plan
  | Phase | Target | Date | Rollback trigger |
  |---|---|---|---|
  | 1 | 10% of users | [date] | Error rate > 1% |
  | 2 | 50% of users | [date] | Error rate > 0.5% |
  | 3 | 100% of users | [date] | None -- permanent |

  ## Cleanup date
  After Phase 3 is stable for 2 sprints: [cleanup-date]

  ## Cleanup checklist
  [ ] Remove flag from code
  [ ] Remove flag from configuration
  [ ] Update tests to remove flag-conditional paths
  [ ] Archive this page
```

---

## 6. Flag cleanup management

### 6.1 Cleanup reminder task

```
Create Jira task at flag creation:
  Summary: "Feature flag cleanup: [flag-name]"
  Due date: Phase 3 date + 2 sprints
  Priority: Medium
  Labels: ai-generated, feature-flag-cleanup

When cleanup is due:
  Notify engineer: "Feature flag [name] is due for cleanup.
  Phase 3 has been stable for [N] days. The flag and its conditional
  code should be removed in the current or next sprint."
```

### 6.2 Flag debt audit

Monthly: search for feature flags past their cleanup date:

```
Search code for flag references:
  -- Flags created > 6 months ago that are still in code
  -- Flags set to 100% rollout but not removed

Flag as tech debt with High severity in TECH_DEBT_REGISTRY.md:
  "Feature flag [name] is 6+ months old and should be removed."
```

---

## 7. HITL gate behaviour

No mandatory HITL gates. Flag creation and cleanup are engineering
decisions made within a sprint. Gate D01 applies to the PR containing
the flag code.

---

## 8. Calls to other agents

```
None -- feature flag management is terminal.
PR with flag code goes through standard A27 Peer Review flow.
```

---

## 9. What the agent must never do

```
-- Create a feature flag without a cleanup date
-- Create a flag without a rollout plan
-- Allow flags to persist beyond 6 months without flagging as tech debt
-- Create flags with percentage rollout without defining the rollback trigger
```

---

## 10. Version and review

| File owner | CoE Core | Review cadence | Quarterly |
| Approvers | CoE Lead |
