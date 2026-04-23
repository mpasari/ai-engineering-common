# CHECK_DEPENDENCIES.md
# Command: CHECK_DEPENDENCIES
# Category: Security
# Agent: A23 Vuln Scan Agent + A24 CVE Triage Agent
# Version: 1.0.0

---

## What this command does

Scans all project dependencies for known CVEs, classifies findings by
severity and exploitability in the Telia context, and generates a
remediation plan. Presents gate E09 for Security Lead approval.

---

## When to use it

- Before a major release
- When a CVE advisory mentions a library you use
- During brownfield discovery security audit

---

## Usage

```
CHECK_DEPENDENCIES

or

CHECK_DEPENDENCIES --critical-only
```

---

## Output

- CVE findings grouped by severity (Critical / High / Medium / Low)
- Exploitability assessment per finding
- KEDB match check (known vs new findings)
- Jira security tickets for Critical and High findings
- Remediation plan with SLA deadlines
- Gate E09 for Security Lead approval

---

## Notes

- Checks against NVD and OSV vulnerability databases
- DEPENDENCY_POLICY.md banned library check runs alongside CVE scan
- Findings without a fix version are assessed for workarounds
