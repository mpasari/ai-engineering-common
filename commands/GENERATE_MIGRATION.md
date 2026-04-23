# GENERATE_MIGRATION.md
# Command: GENERATE_MIGRATION
# Category: Engineering
# Agent: A12 Data Migration Agent
# Version: 1.0.0

---

## What this command does

Generates Flyway/Liquibase migration scripts, rollback scripts, and a
zero-downtime execution plan for a database schema change. Runs a dry-run
against the test database before presenting gate C04.

---

## When to use it

- A story's spec includes data model changes
- A schema change is needed to support a new feature

---

## Required inputs

```
Jira story key (spec must describe the schema change)
Example: GENERATE_MIGRATION PROJ-412
```

---

## Usage

```
GENERATE_MIGRATION PROJ-412
```

---

## What to expect

1. Data Migration Agent reads the spec's data model changes section
2. Reads existing migration files to determine correct version number
3. Assesses downtime risk per change type
4. Selects migration strategy (direct / expand-contract)
5. Generates forward migration and rollback scripts
6. Runs dry-run on test database
7. Presents gate C04 for Tech Lead + DBA approval

---

## Output

- Forward migration: V{N}__description.sql
- Rollback script: V{N}__rollback_description.sql
- Execution plan in Confluence
- Dry-run result (PASS / FAIL with details)
- Gate C04 for Tech Lead + DBA approval

---

## Notes

- Rollback scripts are always generated -- no exceptions
- Personal data columns get COMMENT with retention policy
- NOT NULL additions always use expand-contract, never direct
- Gate A03 required separately before production migration executes
