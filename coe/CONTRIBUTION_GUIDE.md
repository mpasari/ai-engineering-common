# CONTRIBUTION_GUIDE.md
# CoE -- How to contribute to ai-engineering-common
# Version: 1.0.0
# Status: Active
# Last updated: 2026-04
# Owner: CoE Core

---

## 1. Who can contribute

Anyone at Telia Group can contribute to the commons. You do not need to
be a member of the CoE Core team. Contributions are reviewed by two CoE
Core approvers before merging.

The most valuable contributions come from engineers who have used the
commons in their team and found a gap -- a missing agent, an inaccurate
guide, or a pattern that does not match their stack.

---

## 2. Types of contribution

| Type | Description | Review time |
|---|---|---|
| Bug fix | Correcting inaccurate content in an existing file | 1-2 days |
| Enhancement | Improving an existing agent or guide | 2-3 days |
| New command | Adding a command prompt file | 2-3 days |
| New agent | Adding a new agent skill file | 5-7 days |
| New guide | Adding a new SDLC guide | 3-5 days |
| New foundation file | Zero-dependency base file | 7-10 days |

New foundation files require the most review because every agent
loads them. Changes to foundation files affect all 40 agents simultaneously.

---

## 3. Contribution process

### 3.1 Before you start

Check for an existing issue or PR covering the same change:

```
GitHub: https://github.com/telia-company/ai-engineering-common/issues
```

If one exists, comment on it rather than opening a duplicate. If not,
open an issue first describing what you want to change and why. This
lets CoE Core give early feedback before you invest time writing.

### 3.2 Fork and branch

```powershell
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/ai-engineering-common.git
cd ai-engineering-common

# Create a branch from main
git checkout -b feat/add-[short-description]
# or
git checkout -b fix/[short-description]
```

Branch naming:
```
feat/[description]     -- new capability
fix/[description]      -- correction to existing content
refactor/[description] -- restructure without changing meaning
docs/[description]     -- documentation only
```

### 3.3 Write the content

Follow PROMPT_LIBRARY_STANDARDS.md for quality requirements.

Key rules:
- No em dashes (use --) -- em dashes cause encoding issues on Windows
- No curly quotes -- use straight quotes only
- ASCII-safe text throughout -- no Unicode decorative characters
- Line length under 80 characters for code blocks
- All file paths use forward slashes in examples

### 3.4 Test your changes in a consumer project

Before opening a PR, test that your changes work in a real project:

```powershell
# In the commons repo
npm link

# In a consumer project
npm link @telia-company/ai-engineering-common
npx aec update

# Verify the generated files look correct
Get-Content CLAUDE.md | Select-Object -First 20
```

For new agent skill files specifically: verify the agent appears in
the generated CLAUDE.md by checking that its content is included
after running `npx aec update`.

### 3.5 Open the PR

PR title format:
```
feat(agents): add KAFKA_CONSUMER_MONITOR_AGENT.md (A41)
fix(foundation): correct HITL gate B04 approval requirements
docs(sdlc): expand BACKEND_PATTERNS.md C# section
```

PR description must include:
- What changed and why
- Which agents or commands reference this file (if foundation file)
- Test evidence: screenshot or paste of `npx aec update` output showing the change
- Self-review checklist (see section 3.6)

### 3.6 PR self-review checklist

Before submitting, confirm:

```
[ ] Content is accurate -- I have tested this in a real project
[ ] File follows the structure of existing files in the same directory
[ ] No em dashes, curly quotes, or non-ASCII decorative characters
[ ] Code examples compile or run without errors
[ ] File header has: filename, description, version, status, owner
[ ] "What the agent must never do" section present (for agent files)
[ ] Version and review section present (all files)
[ ] No personal data, credentials, or internal URLs in examples
[ ] npx aec update runs without errors after my change
```

---

## 4. Review process

Two CoE Core approvers review every PR. Review criteria:

```
Accuracy:    Is the content correct and tested?
Consistency: Does it match the style and structure of existing files?
Safety:      Does it introduce any harmful patterns or constraints?
Completeness: Are all required sections present?
```

Reviewers may request changes before approving. Address feedback by
pushing to the same branch -- do not open a new PR.

Typical review timelines are in section 2. Complex changes take longer.
Reviews happen during normal working hours Stockholm/Oslo time.

---

## 5. After merge

Once merged, the change is available via npm link immediately for
local testing. It is available via npm install after the next
release tag is pushed by CoE Core.

Release cadence:
- Patch releases: weekly (Friday)
- Minor releases: monthly (first Monday)
- Major releases: quarterly (PI boundaries)

You do not need to tag the release or publish the package.
CoE Core handles all release tagging.

---

## 6. Contribution ideas

If you want to contribute but are not sure where to start:

```
Good first contributions:
  -- Add a missing example to BACKEND_PATTERNS.md for your stack
  -- Improve an agent file's "What the agent must never do" section
  -- Add a checklist item to SECURITY_STANDARDS.md based on a finding
  -- Fix a known gap flagged in an open GitHub issue

More challenging:
  -- Add a new agent skill file for a missing SDLC function
  -- Add a new SDLC stage guide for a practice your team uses
  -- Write a C4 standards guide for the architecture/ directory
```

---

## 7. Code of conduct

Contributions are reviewed based on technical merit, not on who
submits them. All reviewers apply the same standard regardless of
seniority or team. If you disagree with a review decision, raise it
with the CoE Lead.

---

## 8. Version and review

| File owner | CoE Core |
| Review cadence | Quarterly |
| Approvers | CoE Lead |
