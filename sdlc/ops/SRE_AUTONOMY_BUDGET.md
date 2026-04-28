# SRE_AUTONOMY_BUDGET.md
# SDLC -- Ops Stage -- SRE Agent Autonomy Budget
# Version: 1.0.0
# Status: Active
# Last updated: 2026-04
# Owner: CoE Core + SRE Lead
#
# This file is read by:
#   - SRE Agent (A38) -- governs which Tier 1 actions are permitted

---

## 1. Purpose

This file defines the complete list of actions the SRE Agent may take
autonomously at Tier 1 (silent self-heal). Any action not listed here
requires human approval at Tier 2 or higher.

The autonomy budget is deliberately narrow. Expanding it requires a
PR to this file approved by the SRE Lead and CoE Lead.

---

## 2. Tier 1 permitted actions

The SRE Agent may execute these actions without human approval when
the pre-action checks in SRE_AGENT.md section 5.1 all pass:

```
1. Restart a single failing pod
   Trigger: Pod in CrashLoopBackOff or OOMKilled state
   Constraint: Only one pod per service per 60-second cycle
   Command: kubectl delete pod {pod-name} -n {namespace}

2. Scale a deployment up by 1 replica
   Trigger: CPU or memory utilisation above warning threshold
   Constraint: Must not exceed MAX_REPLICAS_PROD from SRE_SERVICE_CONFIG.md
   Command: kubectl scale deployment {name} --replicas={current+1}

3. Scale a deployment down by 1 replica
   Trigger: CPU and memory utilisation below 30% for 30 minutes
   Constraint: Must not go below MIN_REPLICAS_PROD from SRE_SERVICE_CONFIG.md
   Command: kubectl scale deployment {name} --replicas={current-1}

4. Delete a pod in CrashLoopBackOff state
   Trigger: Pod has been in CrashLoopBackOff for more than 5 minutes
   Constraint: At least 1 other healthy pod must exist in the deployment
   Command: kubectl delete pod {pod-name} -n {namespace}

5. Clear a stuck Kubernetes job
   Trigger: Job has exceeded its activeDeadlineSeconds
   Constraint: Job must be in Failed state (not Running)
   Command: kubectl delete job {job-name} -n {namespace}
```

---

## 3. Tier 1 forbidden actions (regardless of signal severity)

The SRE Agent must NEVER take these actions autonomously:

```
-- Delete a Deployment, StatefulSet, DaemonSet, or Namespace
-- Modify a ConfigMap or Secret
-- Change a service's replica count beyond SRE_SERVICE_CONFIG.md bounds
-- Restart more than 1 pod per service per cycle
-- Roll back a deployment (kubectl rollout undo)
-- Apply any kubectl patch or apply command
-- Modify network policies or ingress rules
-- Any action on an unregistered service (not in SRE_DASHBOARD_REGISTRY.md)
-- Any action that requires Azure portal or Azure CLI
```

---

## 4. Action reversal guarantee

Every Tier 1 permitted action must be reversible within 5 minutes.

```
Restart pod -> Kubernetes creates replacement automatically
Scale up    -> Scale down by 1 reverses it
Scale down  -> Scale up by 1 reverses it
Delete pod  -> Kubernetes creates replacement automatically
Delete job  -> Job must be re-triggered manually (acceptable -- job is already failed)
```

If an action cannot be reversed within 5 minutes -- escalate to Tier 2.

---

## 5. Autonomy budget change process

To add a new Tier 1 permitted action:

1. Engineer proposes the action with justification in a PR to this file
2. SRE Lead reviews: Is it genuinely reversible? Is the signal reliable?
3. CoE Lead approves: Is the blast radius acceptable?
4. Merge to main -- SRE Agent picks up the new permission on next restart

To remove a Tier 1 action:
- Any CoE Lead or SRE Lead can remove an action without full review process
  if there is evidence it is causing harm

---

## 6. Version and review

| File owner | CoE Core + SRE Lead |
| Review cadence | Quarterly -- or after any incident caused by autonomous action |
| Approvers | SRE Lead, CoE Lead |
