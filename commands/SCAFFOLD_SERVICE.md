# SCAFFOLD_SERVICE.md
# Command: SCAFFOLD_SERVICE
# Category: Project setup
# Agent: A13 Greenfield Scaffold Agent
# Version: 1.0.0

---

## What this command does

Bootstraps a new service from scratch: GitHub repository, standard
folder structure, commons installation, initial ADRs, CI/CD pipeline,
Confluence space, and first sprint stories. Requires gate B01 (Architect
approves new service creation) before starting.

---

## When to use it

- Starting a brand new service as part of a new project
- Adding a new service to an existing project

---

## Required inputs

```
Service name (required)
Domain (required): orders, billing, customer, etc.
Stack (required): java / typescript / csharp
Team (required): team name

Optional:
  database: postgresql (default) / sqlserver / none
  messaging: kafka (default) / servicebus / none

Example:
  SCAFFOLD_SERVICE name="order-cancellation-service" domain="orders" stack="java" team="orders-team"
```

---

## Usage

```
SCAFFOLD_SERVICE name="product-catalogue-service" domain="catalogue" stack="java" team="catalogue-team"
```

---

## What to expect

1. Gate B01 presented to Architect for new service approval
2. GitHub repository created with standard structure
3. Commons installed, .ai/project/ stubs seeded
4. Confluence space created with initial ADRs
5. CI/CD pipeline scaffolded
6. First 5 foundation stories created in Jira
7. Gate B05 for Architect to finalise initial ADRs

---

## Output

- GitHub repo: https://github.com/telia-company/[service-name]
- Confluence space with architecture overview and ADR set
- Jira epic with 5 foundation stories
- Gate B01 (new service approval) then Gate B05 (ADR approval)

---

## Notes

- All seeded dependencies come from DEPENDENCY_POLICY.md approved list
- ADRs are created in Proposed status -- Accepted after gate B05
- Tool configs (CLAUDE.md, copilot-instructions.md) generated immediately
- Team should fill in .ai/project/ stub files before first sprint
