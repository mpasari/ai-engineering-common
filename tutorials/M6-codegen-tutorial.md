# M6 — Code Generation Tutorial
# AI Engineering Commons — Champions Programme
# Version: 1.0
# Last updated: 2026-05-28
# Prerequisite: M5 complete -- Gate C01 presented by Copilot

---

## What you will achieve by the end of this tutorial

By the end of M6 you will have:
- Reviewed and approved a technical spec at Gate C01
- AI-generated code committed to a feature branch
- A PR review report produced by /review-pr
- Your M6 milestone marked in the Champions Register

**Time to complete:** 1-2 hours
**Difficulty:** Intermediate
**Prerequisites:** M5 complete -- Gate C01 must be presented in your Copilot session
**Next milestone:** M7 — Onboard a Colleague

---

## Why this matters

Gate C01 is the boundary between planning and execution. Everything before it
is thinking, analysis, and documentation. Everything after it is code.

The gate exists because AI-generated code without a reviewed spec creates
the same problems as human-written code without a reviewed spec -- just faster.
The harness enforces the checkpoint. The engineer makes the decision.

---

## Where you should be right now

Copilot has just presented Gate C01 in your chat session. It looks something like:

```
=== GATE C01 ===

Confluence spec: [URL]
Jira story: [SPOCKT-XXXXX]
Module: [module-name]
Risk level: [High / Medium / Low]

DECISIONS REQUIRED BEFORE IMPLEMENTATION:
  [list of decisions or risks found]

To approve: type APPROVED C01
To request changes: type CHANGES C01 followed by your feedback

=== END GATE C01 ===
```

Do not type anything yet. Review the spec first.

---

## Step 1 — Review the spec in Confluence

**What to do:**
Click the Confluence URL shown in the Gate C01 output.

**Read the full spec and check these things:**

```
[ ] The spec accurately describes what the story asks for
[ ] The affected classes and modules are correctly identified
[ ] Any tech debt conflicts are noted (e.g. TD-008 phone normalisation)
[ ] GDPR implications are addressed if the story touches personal data
[ ] The acceptance criteria match the original Jira story
[ ] The spec was written to ECAI space (not your real Confluence space)
[ ] Any Jira stories created went to SPOCKT (not your real project)
```

**Why this step:**
Gate C01 is your last chance to catch a misunderstanding before code is written.
A spec approved with a wrong assumption produces wrong code.
Fixing wrong code takes longer than fixing a wrong spec.

---

## Step 2 — Review the decisions and risks

Gate C01 often lists decisions that must be resolved before implementation.
These are things the AI found that were not in the original ticket.

**Common Gate C01 findings:**

| Finding type | What it means | What to do |
|---|---|---|
| RISK (High) | A known tech debt item conflicts with this story | Decide: fix the debt in the same PR, or add a comment referencing it |
| DECISION | A design choice that was unclear in the original ticket | Answer the question explicitly before approving |
| GDPR | The story touches personal data | Confirm the lawful basis is documented before approving |
| ENCODING | Character encoding risk (e.g. Swedish å ä ö in SMS) | Add explicit AT verification step to acceptance criteria |

**Do not approve until all decisions are answered.**

If you are not sure about a decision -- ask your Tech Lead before approving.

---

## Step 3 — Approve or request changes

### If the spec is correct

Type exactly this in Copilot Chat and press Enter:

```
APPROVED C01
```

**What you should see:**
Copilot acknowledges the approval and proceeds to generate code. You will see
it reading source files, writing new code, and modifying existing classes.

This may take several minutes for complex stories.

### If the spec needs changes

Type this with your specific feedback:

```
CHANGES C01 [your feedback here]
```

**Example:**
```
CHANGES C01 The phone normalisation fix should go in BrmEventMapper,
not in Ace.sendCallback(). The spec currently has it backwards.
Also please remove the [user name] placeholder -- that is out of scope.
```

**What you should see:**
Copilot revises the spec in Confluence and presents Gate C01 again.
Review the revised spec and repeat Step 1 and 2.

---

## Step 4 — Review the generated code

After you type APPROVED C01, Copilot generates code directly in your repository.

**What Copilot does:**
- Creates or modifies source files based on the spec
- Follows the coding standards found in the brownfield scan
- References constraints from TECH_DEBT_REGISTRY.md
- Adds or updates tests if the module has test coverage

**What to check when it finishes:**

```
[ ] The right files were modified (check git diff)
[ ] No unexpected files were changed
[ ] The code compiles (run: ./gradlew build or npm test)
[ ] The logic matches what the spec described
[ ] No credentials or personal data hardcoded
```

**Check git diff in the terminal:**

```powershell
git diff
git status
```

---

## Step 5 — Run /review-pr

Before committing the generated code, run the PR review command:

```
/review-pr
```

**What you should see:**
Copilot reads the generated changes and produces a review report covering:
- Code quality and adherence to existing patterns
- Any BLOCK findings (must fix before merging)
- Any WARN findings (should address before merging)
- Security and PII considerations
- Test coverage gaps

**How to read the report:**

| Finding level | What it means | Action required |
|---|---|---|
| BLOCK | This must be fixed before the code is safe to merge | Fix it before committing |
| WARN | This should be addressed but is not blocking | Review and decide |
| INFO | Observations and suggestions | No action required |

Address all BLOCK findings before committing.

---

## Step 6 — Commit the generated code

Once the review is clean, commit in the terminal (not through Copilot):

```powershell
# Check what was changed
git diff --stat

# Stage the changes
git add [specific files -- do not use git add . blindly]

# Commit with the Jira story reference
git commit -m "feat: [story summary]

Generated by AI Engineering Commons /generate-code
Spec: [Confluence URL from Gate C01]
Story: SPOCKT-XXXXX
Gate C01 approved by: [your name]
PR review: PASS"
```

**Important:** This is a demo run -- do not push to origin.

```powershell
# Verify it is on the demo branch only
git log --oneline -3
git branch
# Should show: * ai-commons-demo
```

---

## Step 7 — Mark your M6 milestone

1. Open the Champions Register:
   https://itwiki.atlassian.teliacompany.net/spaces/ECA/pages/1279990780
2. Find your name
3. Add ✓ (date) in your **M6 Code Gen** column
4. Save

**You have completed M6. ✓**

---

## The full journey you have now completed

```
M1  Environment setup           VS Code + Jira + Confluence MCP
M2  Greenfield tutorial         Idea → epics → stories → spec
M3  Brownfield scan             Codebase scanned and documented
M4  DEEP analysis               Core module fully analysed, risks found
M5  Real story spec             Real ticket specced, Gate C01 presented
M6  Code generation             Spec approved, code generated, PR reviewed
```

From a rough idea or a real ticket to working code -- with every GDPR risk,
tech debt conflict, and architectural concern surfaced automatically along the way.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Copilot starts generating before I type APPROVED C01 | This means a previous session had Gate C01 already approved. Start a new chat session and re-run /write-spec. |
| Generated code does not compile | Run /review-pr -- it will identify the issue. Fix BLOCK findings first. |
| Code was written to wrong module | Check that .ai/project/MODULE_REGISTRY.md is accurate for the affected module. |
| Copilot modified files I did not expect | Run git diff before accepting. Use git checkout [file] to revert individual files. |
| Gate C01 not presented | The prompt file may be missing the gate. Check .github/prompts/write-spec.prompt.md contains the Gate C01 section. |

---

## Next step — M7 Champion

You have completed the full technical journey.

M7 is about multiplying it. Walk a colleague through M1. Be their support
while they complete M2. That single act doubles the adoption rate in your team.

**M7 tutorial:** M7-champion-tutorial.md
