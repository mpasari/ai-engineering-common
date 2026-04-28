# C4_STANDARDS.md
# Architecture -- C4 model standards for Telia architecture documentation
# Version: 1.0.0
# Status: Active
# Last updated: 2026-04
# Owner: CoE Core
#
# This file is read by:
#   - Architecture Doc Agent (A31) -- generates C4 diagrams and pages
#   - Spec Writer Agent (A07) -- architecture section of specs
#   - Greenfield Scaffold Agent (A13) -- initial architecture page

---

## 1. Overview

Telia uses the C4 model (Context, Containers, Components, Code) for
all service architecture documentation. The Architecture Doc Agent
maintains Levels 1 and 2 automatically. Levels 3 and 4 are written
by engineers and architects.

Reference: https://c4model.com

---

## 2. Level 1 -- System context diagram

**What it shows:** The service in relation to its users and external systems.
**Who maintains it:** Architecture Doc Agent (A31) -- auto-updated on INTEGRATION_MAP.md changes.
**Audience:** Anyone -- including non-technical stakeholders.

### 2.1 Content requirements

```
Must include:
  -- The service being described (centre)
  -- All human user types that interact with the service directly
  -- All external systems the service calls (outbound)
  -- All external systems that call the service (inbound)
  -- The relationship label describing what data or action flows

Must NOT include:
  -- Internal implementation details
  -- Database tables or technology choices
  -- More than 15 elements (split into multiple diagrams if needed)
```

### 2.2 Confluence page structure

```
Title: [Service name] -- System context
Labels: architecture, c4-level-1, ai-updated

Content sections:
  ## What this service does
  [2-3 sentences for a non-technical reader]

  ## System context diagram
  [Mermaid diagram -- see section 2.3]

  ## Users
  [Table: user type, what they do, how they interact]

  ## External systems
  [Table: system name, relationship, protocol, DPA status]

  ## What this service does NOT do
  [Explicit non-responsibilities]
```

### 2.3 Mermaid diagram format for Level 1

```
graph TB
    User["Customer<br/>[Person]<br/>Uses the app to manage orders"]
    Service["Order Service<br/>[Software System]<br/>Manages order lifecycle"]
    Billing["Billing Service<br/>[Software System]<br/>Processes payments"]
    Kafka["Kafka<br/>[Message Broker]<br/>Async event bus"]
    Email["Notification Service<br/>[Software System]<br/>Sends emails"]

    User -->|"Place / view / cancel orders<br/>HTTPS"| Service
    Service -->|"Charge for order<br/>REST"| Billing
    Service -->|"Publish OrderPlaced event<br/>Kafka"| Kafka
    Kafka -->|"OrderPlaced event<br/>Kafka"| Email
```

---

## 3. Level 2 -- Container diagram

**What it shows:** The internal structure of the service -- deployable units, databases, message brokers.
**Who maintains it:** Architecture Doc Agent (A31) -- auto-updated on MODULE_REGISTRY.md changes.
**Audience:** Engineering teams, architects.

### 3.1 Content requirements

```
Must include:
  -- All deployable units (services, containers, lambdas)
  -- All data stores (databases, caches, object storage)
  -- All message channels (Kafka topics, queues)
  -- Technology labels on each element
  -- Relationship labels with protocol

Must NOT include:
  -- Internal class or package structure (that is Level 3)
  -- Infrastructure details (Kubernetes, networking) unless essential
```

### 3.2 Confluence page structure

```
Title: [Service name] -- Architecture overview
Labels: architecture, c4-level-2, ai-updated

Content sections:
  ## Container diagram
  [Mermaid diagram]

  ## Containers
  [Table: name, technology, responsibility]

  ## Data stores
  [Table: name, type, what is stored]

  ## Key flows
  [2-3 numbered request flows through the system]

  ## Technology decisions
  [Links to relevant ADRs]
```

### 3.3 Mermaid diagram format for Level 2

```
graph TB
    subgraph "Order Service"
        API["API Layer<br/>[Spring Boot REST Controller]<br/>Handles HTTP requests"]
        App["Application Layer<br/>[Spring Boot Service]<br/>Business orchestration"]
        Domain["Domain Layer<br/>[Java]<br/>Business rules and entities"]
        Infra["Infrastructure Layer<br/>[Spring Data JPA]<br/>Persistence and messaging"]
    end

    DB[("Orders Database<br/>[PostgreSQL 15]<br/>Order and item data")]
    Cache["Cache<br/>[Redis 7]<br/>Session and rate limiting"]
    KafkaTopic["order.order.placed<br/>[Kafka Topic]<br/>Order lifecycle events"]

    API --> App --> Domain --> Infra
    Infra --> DB
    Infra --> Cache
    Infra -->|"Publishes"| KafkaTopic
```

---

## 4. Level 3 -- Component diagram

**What it shows:** The internal structure of a specific container -- classes, packages, components.
**Who maintains it:** Engineers and architects write this. Architecture Doc Agent can generate a draft from Legacy Explainer output.
**Audience:** Engineers working in this module.
**When required:** For complex modules, Legacy modules, and modules being significantly refactored.

### 4.1 Content requirements

```
Must include:
  -- Key classes or components with their responsibility
  -- Dependencies between components
  -- Entry points (controllers, consumers) clearly labelled
  -- Infrastructure interfaces (repositories, clients) clearly labelled

Optional but recommended:
  -- State machines for entities with complex status flows
  -- Key invariants and business rules the component enforces
```

### 4.2 Confluence page structure

```
Title: [Module name] -- Component view
Labels: architecture, c4-level-3

Content sections:
  ## Component diagram
  [Mermaid diagram]

  ## Components
  [Table: name, type, responsibility]

  ## Key invariants
  [List of business rules this component enforces]

  ## Known risks
  [Link to TECH_DEBT_REGISTRY.md entries for this module]
```

---

## 5. Level 4 -- Code

Level 4 is not maintained as a diagram. Code documentation is handled
by:
- Inline code comments for complex logic
- JavaDoc / TSDoc / XML doc comments on public APIs
- The Legacy Explainer Agent output for unfamiliar modules

Generating and maintaining Level 4 diagrams from code is not
cost-effective -- they become stale faster than they can be updated.

---

## 6. Diagram conventions

### 6.1 Element naming

```
Format: [Name]\n[Technology]\n[One-sentence responsibility]

Names: Use plain English, not internal code names
Technology: Be specific -- not "Database" but "PostgreSQL 15"
Responsibility: What it does, not what it is
```

### 6.2 Relationship labels

```
Format: Protocol or mechanism + what flows

Good:
  -->|"REST / HTTPS"| -- technology first
  -->|"OrderPlaced event via Kafka"| -- data + mechanism
  -->|"Reads customer data"| -- what data

Bad:
  -->|"calls"| -- too vague
  -->|"communication"| -- meaningless
  --> -- no label at all
```

### 6.3 Colour conventions (when using C4 Plantuml or Mermaid themes)

```
Service being described:  Blue background
External systems:         Grey background
Data stores:              Cylinder shape (Mermaid: [("...")])
People/users:             Person shape
Message brokers:          Hexagon or queue shape
```

---

## 7. Architecture page maintenance cadence

| Level | Update trigger | Owner |
|---|---|---|
| L1 System context | INTEGRATION_MAP.md changes | Architecture Doc Agent (auto) |
| L2 Container | MODULE_REGISTRY.md changes | Architecture Doc Agent (auto) |
| L3 Component | Significant refactoring, new feature | Engineer + Architect |
| ADR index | New or updated ADR | Architecture Doc Agent (auto) |

Manual review quarterly regardless of automated updates.

---

## 8. Version and review

| File owner | CoE Core |
| Review cadence | Quarterly |
| Last reviewed | 2025-01 |
| Next review due | 2025-04 |
| Approvers | CoE Lead |
