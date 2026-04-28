# PROMPT_LIBRARY_STANDARDS.md
# CoE -- Quality standards for agent and command contributions
# Version: 1.0.0
# Status: Active
# Last updated: 2026-04
# Owner: CoE Core

---

## 1. Purpose

This file defines the quality bar for contributions to the commons.
Every agent skill file, command, guide, and foundation file is
reviewed against these standards before merging.

Understanding these standards before writing saves review cycles.

---

## 2. Universal standards (all file types)

### 2.1 File header

Every file must start with a header block:

```
# FILENAME.md
# [Directory] -- [Brief description of file purpose]
# Version: [N.N.N]
# Status: Active | Draft | Deprecated
# Last updated: [YYYY-MM]
# Owner: [CoE Core | CoE Core + Security Lead | etc.]
```

### 2.2 Text encoding and character rules

These rules prevent encoding issues on Windows and in generated tool
config files:

```
FORBIDDEN characters:
  -- Em dash (--) must be written as two hyphens: --
  -- Curly/smart quotes must be written as straight quotes: " ' 
  -- Ellipsis character must be written as three dots: ...
  -- Any non-ASCII decorative character

REQUIRED:
  -- UTF-8 encoding without BOM
  -- Unix line endings (LF) -- git will handle conversion
  -- Trailing newline at end of file
```

### 2.3 Version and review section

Every file must end with:

```
## [N]. Version and review

| Attribute | Value |
|---|---|
| File owner | [Owner name] |
| Review cadence | Quarterly |
| Last reviewed | [YYYY-MM] |
| Next review due | [YYYY-MM -- 3 months after last reviewed] |
| Approvers | [Roles who approve changes] |
| Change process | [How changes are submitted] |
```

For simple files (commands, short guides), a compact form is acceptable:

```
## N. Version and review

| File owner | CoE Core | Review cadence | Quarterly |
```

### 2.4 No personal data or credentials

```
Never include:
  -- Real email addresses (use user@example.com)
  -- Real phone numbers (use +47 999 00 000)
  -- Real names of specific engineers (use "Tech Lead", "Engineer")
  -- Internal Telia URLs that may contain credentials
  -- Personal identification numbers
  -- Any credential, token, or API key (even test values)
```

### 2.5 Code examples must be runnable

Any code block presented as an example must:
- Compile without errors against the stated language/framework version
- Use fictional data (never real subscriber or employee data)
- Show both the forbidden and required pattern when demonstrating a rule
- Use consistent naming within the file (do not switch entity names mid-file)

---

## 3. Agent skill file standards

Agent skill files are the most complex files in the commons. They must
meet all universal standards plus the following.

### 3.1 Required sections

Every agent skill file must have all of these sections in this order:

```
1. Role and primary responsibility
2. Trigger conditions
3. Context loading
4. Tool access
5. [Core protocol sections -- varies by agent]
6. Output format(s)
7. HITL gate behaviour
8. Calls to other agents
9. What the [Agent name] must never do
10. Version and review
```

Sections 5 and 6 may have agent-specific sub-numbering.

### 3.2 Context loading format

The context loading section must follow this exact format:

```
Fixed (always):
  foundation/AGENT.md
  foundation/HITL_PROTOCOL.md
  agents/THIS_AGENT.md (this file)

[Category] (always | on demand):
  [file path]
    -- [One sentence explaining what this file provides to the agent]
```

Do not list files in context loading that the agent does not actually
use. Every listed file must be referenced in the protocol sections.

### 3.3 Tool access format

```
T-[TOOL-CODE]   [Tool name] ([what this agent uses it for])
```

Tool codes must match TOOLS_MANIFEST.md exactly. Do not invent new
tool codes. If the agent needs a tool not in the manifest, raise an
issue to add it to TOOLS_MANIFEST.md first.

### 3.4 "What the agent must never do" section

This section is the safety contract of the agent. It must:
- List at minimum 5 specific prohibitions
- State the prohibition in the negative: "Never do X"
- Include a reason in parentheses for each prohibition
- Cover: data handling, production safety, gate bypassing, scope creep

Format:
```
-- [Prohibition]
   ([Why this matters -- one sentence])
```

### 3.5 HITL gate behaviour section

If the agent has no mandatory gates: state this explicitly and explain
the oversight mechanism (e.g. "results are advisory, reviewed in the
normal PR process").

If the agent has gates: show the gate output format using the
HITL_PROTOCOL.md gate format exactly. Gates must reference the
correct gate code (A01-E09).

### 3.6 Output format section

Every output format must:
- Show a complete realistic example, not just a skeleton
- Demonstrate the exact structure engineers will see
- Use fictional data where personal data fields appear
- Include the agent footer line:
  `[Agent name] (commons v[N.N.N]) | [Context key]`

---

## 4. Command file standards

Command files are prompt templates. They must be practical and brief.

### 4.1 Required sections

```
1. What this command does (2-4 sentences)
2. When to use it (3-5 bullet points)
3. Required inputs (format + examples)
4. Usage (exact syntax the engineer types)
5. What to expect (numbered steps)
6. Output (what is produced)
7. Notes (edge cases, caveats -- optional)
```

### 4.2 Usage examples must be realistic

```
Good:
  WRITE_SPEC PROJ-412
  TRIAGE_BUG PROJ-500
  REVIEW_PR 142

Bad:
  WRITE_SPEC [your-ticket-key]
  TRIAGE_BUG <insert-jira-ticket-here>
```

Use real-looking Jira keys and PR numbers. Engineers copy from examples.

### 4.3 Maximum length

Command files should not exceed 100 lines. Commands are reference cards,
not tutorials. If you need more than 100 lines, the content belongs in
an SDLC guide or agent skill file instead.

---

## 5. SDLC guide standards

SDLC guides are reference documents for engineering practices.

### 5.1 Required elements

- Clear statement of which agents read this file (in header comment)
- Practical examples for every rule (not just the rule statement)
- BAD/GOOD pattern for prohibited vs required approaches
- Reference to the standard it enforces (e.g. "per CODING_STANDARDS.md section 3")
- Tables for decision matrices and classification schemes

### 5.2 Stack coverage

When a guide covers code patterns, it must cover all three primary stacks
unless the guide is explicitly stack-specific:
- Java / Spring Boot
- TypeScript / React or Next.js
- C# / ASP.NET Core

If you only know one stack, write for that stack and note that coverage
for the others is needed. A partial guide is better than no guide.

---

## 6. Foundation file standards

Foundation files are zero-dependency references loaded by all agents.
They have the highest review bar.

### 6.1 Zero circular dependencies

Foundation files must not reference other foundation files in their
context loading section. They are loaded independently. If a foundation
file needs to reference another, use a plain text reference (section name),
not a file path dependency.

### 6.2 Completeness over brevity

Foundation files are loaded once and referenced by many agents. They
must be complete enough that an agent can act on them without needing
additional context. Err on the side of detail.

### 6.3 Checklist format for rules

Rules in foundation files use checklist items with severity prefix:

```
BLOCK -- [Rule that must never be violated]
WARN  -- [Rule that should be followed with explicit exception process]
INFO  -- [Guidance that improves quality but is not enforced]
```

---

## 7. Review checklist for PR authors

Before submitting a PR to the commons, confirm:

```
Universal:
  [ ] File header present with all required fields
  [ ] No em dashes, curly quotes, or non-ASCII decorative characters
  [ ] Version and review section at the end
  [ ] No personal data, credentials, or real internal URLs
  [ ] Code examples compile/run without errors

Agent files:
  [ ] All 9 required sections present
  [ ] Context loading uses correct format and references real files
  [ ] Tool codes match TOOLS_MANIFEST.md
  [ ] "Must never do" section has at least 5 prohibitions with reasons
  [ ] HITL gates reference correct gate codes from HITL_PROTOCOL.md
  [ ] Output format shows a complete realistic example

Command files:
  [ ] All 6 required sections present
  [ ] Usage examples use real-looking Jira keys/PR numbers
  [ ] Under 100 lines

SDLC guides:
  [ ] Header comment states which agents read this file
  [ ] BAD/GOOD pattern for prohibited approaches
  [ ] Covers all three primary stacks (or explicitly noted as stack-specific)

Foundation files:
  [ ] No circular dependencies in context loading
  [ ] Rules use BLOCK/WARN/INFO severity prefix
  [ ] Complete enough to act on without additional context
```

---

## 8. Version and review

| File owner | CoE Core |
| Review cadence | Quarterly |
| Approvers | CoE Lead |
