# REFRESH_ARCH_DOCS.md
# Command: REFRESH_ARCH_DOCS
# Category: Architecture
# Agent: A31 Architecture Doc Agent
# Version: 1.0.0

---

## What this command does

Updates Confluence architecture documentation from the current state of
MODULE_REGISTRY.md and INTEGRATION_MAP.md. Refreshes the system context
diagram, container view, and ADR index.

---

## When to use it

- After a significant merge that added modules or integrations
- Monthly architecture documentation review
- After brownfield discovery populates the project-layer files

---

## Required inputs

```
Optional service name (default: all services in MODULE_REGISTRY.md)
Example: REFRESH_ARCH_DOCS
         REFRESH_ARCH_DOCS order-service
```

---

## Usage

```
REFRESH_ARCH_DOCS

or

REFRESH_ARCH_DOCS order-service
```

---

## Output

- Updated system context page in Confluence
- Updated architecture overview page
- Updated ADR index (new or status-changed ADRs)
- Discrepancy report if code and documentation are out of sync

---

## Notes

- Human-authored sections are preserved -- only agent sections are updated
- ADR status changes require Architect instruction -- agent updates index only
- Discrepancies are flagged, not silently corrected
