# REVIEW_SPEC.md
# Command: REVIEW_SPEC
# Category: Specification
# Agent: A07 Spec Writer Agent
# Version: 1.0.0

---

## What this command does

Reviews an existing technical specification for completeness, consistency,
and compliance with API_DESIGN_STANDARDS.md and COMPLIANCE_STANDARDS.md.
Identifies gaps, ambiguous ACs, and missing sections.

---

## When to use it

- Before presenting a manually written spec at gate C01
- When reviewing a spec from another team for integration work

---

## Required inputs

```
Confluence page URL or Jira story key
Example: REVIEW_SPEC https://telia-company.atlassian.net/wiki/...
         REVIEW_SPEC PROJ-412
```

---

## Usage

```
REVIEW_SPEC PROJ-412
```

---

## Output

- Structured review comment on the Confluence page or Jira story
- Gaps identified: missing sections, ambiguous ACs, missing NFRs
- Compliance gaps: GDPR, DPA, security requirements
- Recommendation: Ready for C01 / Needs revision

---

## Notes

- Does not modify the spec -- adds a review comment only
- Human authors retain ownership of their spec content
