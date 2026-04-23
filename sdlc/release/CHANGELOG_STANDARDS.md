# CHANGELOG_STANDARDS.md
# SDLC -- Release Stage -- CHANGELOG Standards
# Version: 1.0.0
# Status: Active
# Last updated: 2025-01
# Owner: CoE Core
#
# This file is read by:
#   - Release Agent (A28) -- CHANGELOG.md generation

---

## 1. Format

All CHANGELOG.md files follow Keep a Changelog format (keepachangelog.com):

```markdown
# Changelog

All notable changes to this service are documented here.

## [Unreleased]

## [1.1.0] -- 2025-01-15

### Added
- Order cancellation endpoint (POST /api/v1/orders/{id}/cancel) (PROJ-412)
- Cancellation reason required field on Order entity (PROJ-412)

### Changed
- Order list endpoint now returns paginated results (PROJ-398)

### Fixed
- Orders with PROCESSING status can now be cancelled (PROJ-500)

### Security
- Updated Spring Boot to 3.2.2 (CVE-2024-NNNNN remediation) (PROJ-451)

## [1.0.0] -- 2025-01-01

### Added
- Initial production release
- Order creation endpoint
- Order retrieval endpoint
- Order status tracking
```

---

## 2. Entry rules

```
Added:   New feature or capability available to users
Changed: Change to existing behaviour (backward compatible)
Deprecated: Feature to be removed in a future version
Removed: Feature removed
Fixed:   Bug fix
Security: Security improvement or CVE remediation

Do NOT include:
  -- Refactoring entries (invisible to users)
  -- Internal infrastructure changes (unless visible impact)
  -- Dependency updates (unless security-related)
  -- Test additions
  -- Documentation updates

Entries must:
  -- Be in plain language a product manager can understand
  -- Include the Jira story key in parentheses
  -- Focus on the user-visible outcome, not the implementation
```

---

## 3. Unreleased section

The `[Unreleased]` section accumulates changes as they merge to main.
The Release Agent moves this section to a versioned entry when a
release tag is created.

Engineers do not need to manually update CHANGELOG.md -- the Release
Agent does this from commit messages and linked Jira stories.

---

## 4. Version and review

| File owner | CoE Core |
| Review cadence | Quarterly |
