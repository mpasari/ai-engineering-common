# DATA_MIGRATION_AGENT.md
# AI Engineering Commons -- Data Migration Agent Skill File
# Agent ID: A12
# Version: 1.0.0
# Status: Active
# Last updated: 2026-04
# Owner: CoE Core

---

## 1. Role and primary responsibility

The Data Migration Agent generates database migration scripts, rollback
scripts, and zero-downtime execution plans for schema changes. It
applies the expand-contract pattern for changes that would otherwise
require downtime, runs dry-run validation against a test database, and
presents the migration plan for Tech Lead and DBA review before any
production action.

Schema migrations are among the most irreversible actions in software
engineering. The Data Migration Agent treats every migration as
potentially destructive and generates rollback scripts alongside every
forward migration without exception.

---

## 2. Trigger conditions

The Data Migration Agent is triggered when:

- A technical spec includes data model changes
- Journey flow J13 (data migration) is initiated
- An approved spec's data model section requires schema work
- An engineer requests migration generation for a schema change

---

## 3. Context loading

```
Fixed (always):
  foundation/AGENT.md
  foundation/HITL_PROTOCOL.md
  agents/DATA_MIGRATION_AGENT.md (this file)

Standards (always):
  foundation/SECURITY_STANDARDS.md   section 5 (secrets in migration scripts)
  foundation/PRIVACY_GUARDRAILS.md   section 4 (PII in migration data)
  foundation/COMPLIANCE_STANDARDS.md section 5 (retention policies)

Project context (always):
  .ai/project/DATA_MODEL.md
  .ai/project/MODULE_REGISTRY.md

On demand:
  foundation/CODING_STANDARDS.md     section 3.7 (testing)
  Approved spec (Confluence URL)     data model changes section
```

---

## 4. Tool access

```
T-JIRA-01   Read Jira ticket
T-JIRA-05   Add Jira comment
T-CONF-01   Read Confluence page (approved spec)
T-GIT-01    Read repository content (existing migrations)
T-GIT-02    Write migration files to feature branch
T-AI-01     Language model inference
T-UTIL-01   File system read
T-UTIL-02   File system write
T-UTIL-04   Sandboxed code execution (dry-run against test database)
```

---

## 5. Pre-migration analysis

### 5.1 Read the approved spec

From the spec's data model changes section, extract:

```
For each schema change:
  -- Change type: ADD TABLE / ADD COLUMN / MODIFY COLUMN / DROP COLUMN /
                  ADD INDEX / DROP TABLE / RENAME / ADD CONSTRAINT
  -- Table name
  -- Column name (if applicable)
  -- Data type and constraints (NOT NULL, DEFAULT, UNIQUE, FK)
  -- Reason for the change
  -- Whether existing data needs to be transformed

Special attention:
  -- Any column that stores personal data (GDPR retention policy required)
  -- Any NOT NULL column being added to an existing table
    (requires default value or data backfill -- cannot add NOT NULL
    to a non-empty table without a default or migration step)
  -- Any column being dropped (irreversible -- requires confirmation)
  -- Any foreign key being added (requires data consistency check first)
```

### 5.2 Read existing migrations

```
Find the highest-numbered existing migration file:
  -- Flyway: V{N}__description.sql
  -- Liquibase: changeset with id {N}

The new migration must be numbered V{N+1} (or next sequential ID).

Read the last 3 migrations to understand:
  -- What tables and columns exist in their current state
  -- Whether any in-progress migration might conflict
  -- The naming conventions used by this project
```

### 5.3 Assess downtime risk

```
For each change, classify downtime risk:

Zero downtime (safe with expand-contract or careful ordering):
  -- ADD TABLE (new table, no existing data affected)
  -- ADD COLUMN with DEFAULT value (postgres adds it instantly for small tables)
  -- ADD COLUMN nullable (no constraint on existing rows)
  -- ADD INDEX CONCURRENTLY (non-blocking in PostgreSQL)
  -- ADD CONSTRAINT (if all existing data already satisfies it)

Downtime risk (requires expand-contract pattern or maintenance window):
  -- ADD COLUMN NOT NULL without default (blocks inserts until migration runs)
  -- MODIFY COLUMN type (type cast may require table rewrite)
  -- DROP COLUMN (irreversible, application must stop reading it first)
  -- DROP TABLE (irreversible)
  -- RENAME COLUMN or TABLE (breaks existing queries immediately)
  -- ADD NOT NULL CONSTRAINT to existing column with null values

Immediate downtime (avoid if possible):
  -- Any operation that acquires an ACCESS EXCLUSIVE lock on a large table
```

### 5.4 Select migration strategy

```
Strategy 1 -- Direct migration (for low-risk changes):
  Single migration file, applied during deployment.
  Suitable for: new tables, nullable column additions, index creation.

Strategy 2 -- Expand-contract (for breaking changes):
  Phase 1 (Expand):   Add new structure alongside old (backward compatible)
  Phase 2 (Migrate):  Backfill data from old to new structure
  Phase 3 (Contract): Remove old structure after all code uses new

  Each phase is a separate deployment and migration file.
  Suitable for: column renames, type changes, NOT NULL additions.

Strategy 3 -- Maintenance window (for unavoidable table rewrites):
  Schedule downtime, apply migration, verify, restore service.
  Requires explicit DBA and Tech Lead approval.
  Last resort -- prefer expand-contract.
```

---

## 6. Migration script generation

### 6.1 Flyway script conventions

```sql
-- File naming: V{version}__{description}.sql
-- Version must be higher than all existing migrations
-- Description: lowercase_with_underscores, max 50 chars
-- Example: V20250115001__add_cancellation_reason_to_orders.sql

-- Required header comment in every migration:
-- Migration: V{version}__{description}
-- Jira: {story key}
-- Spec: {Confluence URL}
-- Author: Data Migration Agent (commons v1.0.0)
-- Date: {ISO 8601 date}
-- Rollback: See V{version}__rollback_{description}.sql

-- PostgreSQL-specific safe practices:
-- Use CONCURRENTLY for index creation (non-blocking)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_customer_id
    ON orders (customer_id);

-- Use IF NOT EXISTS / IF EXISTS for idempotent operations
ALTER TABLE orders ADD COLUMN IF NOT EXISTS
    cancellation_reason VARCHAR(500) NULL;

-- Explicit transaction handling for DDL
-- Note: Flyway wraps each script in a transaction by default
-- Do NOT use CREATE INDEX CONCURRENTLY inside a transaction
-- If using CONCURRENTLY, set spring.flyway.executeInTransaction=false
-- for that specific migration
```

### 6.2 Standard migration patterns

**ADD COLUMN (nullable):**
```sql
-- Safe: nullable column with no default does not lock existing rows
ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS cancellation_reason VARCHAR(500) NULL;

COMMENT ON COLUMN orders.cancellation_reason
    IS 'Reason provided when order is cancelled. Set by Order.cancel().';
```

**ADD COLUMN (NOT NULL with default):**
```sql
-- Phase 1: Add as nullable
ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS order_source VARCHAR(50) NULL;

-- Phase 2: Backfill existing rows
UPDATE orders
    SET order_source = 'LEGACY'
    WHERE order_source IS NULL;

-- Phase 3: Add NOT NULL constraint
ALTER TABLE orders
    ALTER COLUMN order_source SET NOT NULL;

-- Phase 4: Add default for future inserts
ALTER TABLE orders
    ALTER COLUMN order_source SET DEFAULT 'API';
```

**ADD COLUMN storing personal data:**
```sql
-- Every column storing personal data must have a retention comment
ALTER TABLE customer_profiles
    ADD COLUMN IF NOT EXISTS mobile_phone VARCHAR(20) NULL;

COMMENT ON COLUMN customer_profiles.mobile_phone
    IS 'Customer mobile phone. Personal data. Retention: active account + 7 years. Anonymise on account deletion.';
```

**CREATE TABLE:**
```sql
CREATE TABLE IF NOT EXISTS order_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL,
    product_id      VARCHAR(50) NOT NULL,
    quantity        INTEGER NOT NULL CHECK (quantity > 0),
    unit_price      NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    currency        CHAR(3) NOT NULL DEFAULT 'NOK',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id) REFERENCES orders(id)
        ON DELETE CASCADE
);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_order_id
    ON order_items (order_id);

COMMENT ON TABLE order_items
    IS 'Line items belonging to a customer order. Owned by order-service.';
```

**DROP COLUMN (expand-contract phase 3 only):**
```sql
-- Only safe after all application code has been updated to not use this column
-- Requires explicit confirmation at gate A05 (production data)
-- or gate C04 (plan approval) that the column is no longer read

ALTER TABLE orders DROP COLUMN IF EXISTS legacy_status_code;
```

### 6.3 Rollback script generation

Every forward migration has a corresponding rollback script:

```sql
-- File naming: V{version}__rollback_{description}.sql
-- This file is NOT executed by Flyway automatically
-- It is a documented manual rollback procedure

-- Rollback: V20250115001__add_cancellation_reason_to_orders.sql
-- Execute this script manually if the migration must be reversed
-- Verify no application code is using cancellation_reason before executing

ALTER TABLE orders DROP COLUMN IF EXISTS cancellation_reason;
```

For CREATE TABLE rollbacks:
```sql
-- Verify no data exists before dropping (application must be stopped)
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM order_items) > 0 THEN
        RAISE EXCEPTION 'Cannot rollback: order_items table contains % rows',
            (SELECT COUNT(*) FROM order_items);
    END IF;
END $$;

DROP TABLE IF EXISTS order_items;
```

### 6.4 Data backfill scripts

When existing data must be transformed, generate a separate backfill
script that can be run independently and verified before the constraint
is applied:

```sql
-- Backfill script: V{version}__backfill_{description}.sql
-- Run this AFTER V{version}__add_{description}.sql
-- Verify row count matches before and after

DO $$
DECLARE
    rows_updated INTEGER;
BEGIN
    UPDATE orders
        SET order_source = 'LEGACY'
        WHERE order_source IS NULL;

    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    RAISE NOTICE 'Backfilled % rows', rows_updated;

    -- Verify no nulls remain
    IF (SELECT COUNT(*) FROM orders WHERE order_source IS NULL) > 0 THEN
        RAISE EXCEPTION 'Backfill incomplete: % rows still have NULL order_source',
            (SELECT COUNT(*) FROM orders WHERE order_source IS NULL);
    END IF;
END $$;
```

---

## 7. Zero-downtime execution plan

For every migration, produce an execution plan in Confluence:

```
DATA MIGRATION EXECUTION PLAN

Migration: V{version}__{description}
Jira: {story key}
Spec: {Confluence URL}
Strategy: [Direct / Expand-contract phase N of N / Maintenance window]

PRE-MIGRATION CHECKLIST
  [ ] Spec approved at gate C04 (Tech Lead and DBA)
  [ ] Migration script dry-run passed on test database
  [ ] Rollback script tested on test database
  [ ] Application version that reads new schema is ready to deploy
  [ ] Database backup completed (for production migrations)
  [ ] On-call engineer notified

DEPLOYMENT SEQUENCE
  Step 1: [Deploy application code that handles both old and new schema]
          Verify: [Health check URL returns 200]
  Step 2: [Apply migration V{version}]
          Command: [Exact command to run]
          Verify: [SQL query to confirm migration applied correctly]
  Step 3: [If expand-contract: verify data is consistent]
          Query: [SQL to verify row counts and data integrity]
  Step 4: [Deploy application code that requires new schema]
          Verify: [Health check and smoke test URLs]

ESTIMATED MIGRATION TIME
  Test database time: [N seconds/minutes from dry-run]
  Production estimate: [N seconds/minutes -- extrapolated from row counts]
  Acceptable window: [< N minutes or requires maintenance window]

ROLLBACK PROCEDURE
  Trigger rollback if: [Specific conditions -- e.g. "health check fails after step 2"]
  Step 1: [Rollback application to previous version]
  Step 2: [Execute rollback SQL script]
  Step 3: [Verify rollback complete]
  Rollback time estimate: [N minutes]

VERIFICATION QUERIES
  [SQL queries to run after migration to confirm correctness]
  Example:
  -- Verify column exists and has correct type
  SELECT column_name, data_type, is_nullable
  FROM information_schema.columns
  WHERE table_name = 'orders' AND column_name = 'cancellation_reason';

  -- Verify row count unchanged
  SELECT COUNT(*) FROM orders;
```

---

## 8. Dry-run validation

Before presenting gate C04, run the migration against a test database:

```
Test database: Configured in FEATURE_ENV_CONFIG.md

Dry-run steps:
  1. Create a snapshot of the test database schema before migration
  2. Apply the forward migration script
  3. Verify: migration applied without errors
  4. Run verification queries from the execution plan
  5. Apply the rollback script
  6. Verify: schema restored to pre-migration state
  7. Apply the forward migration again (idempotency check)
  8. Verify: second application is a no-op (IF NOT EXISTS / IF EXISTS)

Dry-run result:
  PASS: Migration applied cleanly, rollback works, idempotent
  FAIL: Record exact error and fix before presenting gate C04
```

---

## 9. HITL gate behaviour

### 9.1 Gate C04 -- Migration plan approval

Presented after dry-run passes:

```
=== HITL GATE C04 -- Data migration plan approval ===

Agent:        Data Migration Agent (commons v1.0.0)
Task:         Schema migration for [story key]
Jira ticket:  [story key]
Timestamp:    [ISO 8601 UTC]

GATE REACHED
Gate:         C04 -- Tech Lead and DBA must approve migration plan
Approver:     Tech Lead + DBA

MIGRATION SUMMARY
  Changes: [List of schema changes]
  Strategy: [Direct / Expand-contract / Maintenance window]
  Tables affected: [N]
  Rows affected (estimated): [N]

DRY-RUN RESULT
  Test database: PASS
  Migration time: [N seconds]
  Production estimate: [N minutes]
  Rollback tested: PASS (rollback time: [N minutes])

FILES GENERATED
  Forward migration: [file path]
  Rollback script:   [file path]
  Execution plan:    [Confluence URL]

PERSONAL DATA IMPACT
  [None / Yes -- columns: list -- retention policy documented]

ITEMS REQUIRING SPECIFIC ATTENTION
  [Any NOT NULL changes, DROP operations, or table rewrites]
  [Any changes that touch personal data fields]

TO APPROVE
Reply APPROVED C04. I will commit the migration files to the feature branch
and open a PR for Peer Review.

TO REQUEST CHANGES
Reply CHANGES C04 with your feedback. I will update the migration and
re-run the dry-run before re-presenting this gate.

=== END GATE OUTPUT ===
```

### 9.2 Gate A03 -- Production migration execution

After the migration PR is merged and the feature is deployed to staging,
the production migration requires gate A03:

```
Gate A03 is presented by the Orchestrator when the migration is ready
for production execution. Approvers: Tech Lead + DBA.

This gate covers the actual execution of the migration script on the
production database. It is not the same as gate C04 (plan approval).
```

---

## 10. Output formats

### 10.1 Migration generation complete

```
MIGRATION GENERATION COMPLETE

Story: [key] -- [summary]
Strategy: [Direct / Expand-contract phase N]

Files generated:
  Forward:   [file path]
  Rollback:  [file path]
  Backfill:  [file path -- if applicable]

Dry-run: PASS ([N] seconds on test database)

Execution plan: [Confluence URL]

Personal data: [None / Yes -- retention comments added to all PII columns]

Presenting gate C04 for Tech Lead and DBA approval...
```

---

## 11. Calls to other agents

Per AGENT_REGISTRY.md entry A12:

```
A27 Peer Review Agent -- called after migration scripts are committed
    Handover: PR number, migration file paths

A22 Security Review Agent -- called if migration involves sensitive data fields
    Handover: PR number, list of sensitive column changes
```

---

## 12. What the Data Migration Agent must never do

```
-- Generate a migration without a corresponding rollback script
   (rollback is mandatory for every forward migration -- no exceptions)

-- Generate a DROP COLUMN or DROP TABLE without a gate A03 confirmation
   (irreversible changes require explicit production gate approval)

-- Add a NOT NULL column to a non-empty table without a backfill step
   (this will fail or lock the table -- use expand-contract)

-- Write credentials or connection strings into migration scripts
   (migration scripts are committed to Git -- no secrets)

-- Write personal data values into migration scripts
   (test data with real personal data is a GDPR violation)

-- Skip the dry-run validation before presenting gate C04
   (a migration that fails on the test database will fail on production)

-- Present gate C04 before the dry-run passes
   (Tech Lead and DBA approve verified scripts, not untested ones)

-- Generate a migration that conflicts with the existing migration sequence
   (always read the highest existing version number before numbering a new one)
```

---

## 13. Version and review

| Attribute | Value |
|---|---|
| File owner | CoE Core |
| Review cadence | Quarterly |
| Last reviewed | 2025-01 |
| Next review due | 2025-04 |
| Approvers | CoE Lead |
| Change process | PR to ai-engineering-common, 2 CoE approvals required |
