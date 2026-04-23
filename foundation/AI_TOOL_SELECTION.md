# AI_TOOL_SELECTION.md
# AI Engineering Commons -- AI Tool Selection Guide
# Version: 1.0.0
# Status: Active
# Last updated: 2025-01
# Owner: CoE Core

---

## 1. Purpose

This file helps engineers and agents select the right AI tool for
a given task. Telia engineering teams have access to three primary
AI coding tools: GitHub Copilot, Claude Code, and Cursor. Each has
different strengths, context awareness, and operating models.

Referenced by:
- `AGENT.md` section 9 -- listed as a required foundation file
- `scripts/cli.js` -- generates tool-specific config files per this guide
- `coe/ONBOARDING_CHECKLIST.md` -- engineers read this during onboarding
- `coe/CHAMPION_GUIDE.md` -- champions use this when coaching teams

This file is NOT a ranking. All three tools are approved and useful.
The goal is to match the tool to the task so engineers get the best
output with the least friction.

---

## 2. Quick selection reference

| Task type | Best tool | Why |
|---|---|---|
| Inline code completion while typing | GitHub Copilot | Fastest, lowest friction, IDE-native |
| Single function or class generation | GitHub Copilot or Cursor | Either works well for contained tasks |
| Multi-file feature implementation | Claude Code | Best multi-file reasoning and context |
| Explaining unfamiliar code | Claude Code or Cursor | Both handle large context well |
| Refactoring across many files | Claude Code | Agentic mode, can plan and execute |
| PR review and code analysis | Claude Code | Reads full diff, reasons across files |
| Debugging a complex error | Cursor or Claude Code | Both good at iterative diagnosis |
| Writing tests for existing code | GitHub Copilot or Cursor | Fast for contained test generation |
| Architecture discussion and planning | Claude Code | Best at reasoning and document generation |
| Generating documentation | Claude Code | Produces structured markdown well |
| Quick boilerplate (imports, getters) | GitHub Copilot | Lowest latency for trivial completions |
| Long context tasks (spec + code) | Claude Code | Largest effective context window |

---

## 3. GitHub Copilot

### 3.1 What it is best at

GitHub Copilot is embedded directly in the IDE (VS Code, IntelliJ).
It works at the line and function level, completing code as you type.
It is the lowest-friction AI tool -- no context switching, no prompt
engineering required for basic use.

Best scenarios:
- Completing the body of a function you have already started
- Generating boilerplate (constructors, getters, imports, test stubs)
- Suggesting the next line when the pattern is clear from context
- Writing simple unit tests for a function you just wrote
- Renaming and refactoring within a single file
- Generating repetitive code patterns (CRUD operations, DTO mappings)

### 3.2 When to choose something else

Copilot works best within a single file or a small, clearly defined
scope. When the task requires:
- Understanding how multiple files relate to each other
- Following a complex specification across many layers
- Generating code that must respect conventions defined elsewhere
- Planning a sequence of changes before executing them

...then Claude Code or Cursor will produce better results.

### 3.3 How the commons enhances Copilot

The `aec update` CLI generates `.github/copilot-instructions.md`
which gives Copilot awareness of:
- The agent identity and constraints from AGENT.md
- The project architecture from ARCHITECTURE_OVERVIEW.md
- The module structure from MODULE_REGISTRY.md
- Project-specific coding overrides

This means Copilot suggestions will respect the project's patterns
and naming conventions without the engineer needing to explain them
in every prompt.

### 3.4 Copilot maturity levels

| Level | Usage pattern | What to learn |
|---|---|---|
| L1 -- Reactive | Accept or reject inline suggestions | Recognise good vs bad suggestions |
| L2 -- Prompted | Use Copilot Chat to ask specific questions | Write clear, specific questions |
| L3 -- Context-aware | Use copilot-instructions.md to set context | Maintain the instructions file |
| L4 -- Agent mode | Use Copilot agent mode for multi-step tasks | Define goals, review checkpoints |

Most engineers start at L1-L2. Target for all engineers is L3 within
the first 3 months. L4 is advanced and requires deliberate practice.

---

## 4. Claude Code

### 4.1 What it is best at

Claude Code is a CLI-based agentic tool that operates on the full
repository. It reads and writes files, runs commands, and reasons
across the entire codebase. It is the tool of choice for complex,
multi-file, or multi-step tasks.

Best scenarios:
- Implementing a full feature from a specification
- Refactoring code across many files with a defined target pattern
- Explaining a complex legacy codebase module by module
- Writing and running tests, then fixing failures iteratively
- Generating structured documentation (specs, ADRs, runbooks)
- Architecture planning with multiple options and trade-offs
- Long conversations that build on previous context
- Any task where the CLAUDE.md project context matters

### 4.2 How the commons enhances Claude Code

The `aec update` CLI generates `CLAUDE.md` in the repo root which
gives Claude Code a comprehensive project context including:
- Full AGENT.md (identity and constraints)
- Full CODING_STANDARDS.md
- Full SECURITY_STANDARDS.md
- Full API_DESIGN_STANDARDS.md
- Project ARCHITECTURE_OVERVIEW.md
- Project MODULE_REGISTRY.md
- Project INTEGRATION_MAP.md
- Project DATA_MODEL.md

Claude Code reads `CLAUDE.md` automatically on startup. This means
every Claude Code session starts with full project awareness without
any manual context-setting by the engineer.

### 4.3 Claude Code operating modes

| Mode | When to use | Command |
|---|---|---|
| Interactive chat | Planning, explaining, reviewing | `claude` |
| One-shot task | Single well-defined output | `claude -p "task description"` |
| Agentic (auto-approve) | Trusted, well-scoped tasks | `claude --auto-approve` |
| Plan then execute | Complex tasks needing review | `claude --plan` then review before run |

For most development tasks, use interactive mode. Reserve
`--auto-approve` for well-understood, low-risk tasks like generating
boilerplate or formatting files.

### 4.4 Effective prompting for Claude Code

```
Good prompt structure for complex tasks:
  1. Context: "I am working on the Orders service..."
  2. Goal: "I need to implement order cancellation..."
  3. Constraints: "Follow CODING_STANDARDS.md, the spec is at [URL]..."
  4. Scope: "Touch only the domain and application layers..."
  5. Output: "Generate the code, then the tests, then open a PR draft..."

Anti-patterns to avoid:
  - Vague goals: "Make the code better"
  - No scope: "Fix everything in the orders module"
  - No constraints: "Write tests" (without specifying framework, coverage target)
  - Combining unrelated tasks: "Implement the feature and also update the docs"
```

---

## 5. Cursor

### 5.1 What it is best at

Cursor is an AI-native IDE (fork of VS Code) that integrates AI
at every level of the editing experience. It offers inline completion
like Copilot, chat like Claude Code, and codebase-aware context
through its automatic indexing of the repository.

Best scenarios:
- Engineers who prefer to stay in an IDE rather than switching to CLI
- Tasks that mix browsing, editing, and asking questions fluidly
- Debugging where you want to click on code and ask questions inline
- Multi-file editing with visual feedback on changes
- Teams transitioning from a pure Copilot workflow to agentic AI
- Rapid iteration: generate, see result, tweak, repeat

### 5.2 How the commons enhances Cursor

The `aec update` CLI generates `.cursorrules` in the repo root which
gives Cursor awareness of:
- Coding standards from CODING_STANDARDS.md
- Project-specific overrides from `.ai/project/OVERRIDES/CODING_STANDARDS.md`

Cursor reads `.cursorrules` automatically. Engineers can also
reference `CLAUDE.md` manually in Cursor's composer for fuller
project context when needed.

### 5.3 Cursor vs Claude Code -- when to choose

| Prefer Cursor when... | Prefer Claude Code when... |
|---|---|
| You want to stay in the IDE | You are comfortable with CLI |
| The task involves visual code browsing | The task is purely generative |
| You want inline AI alongside editing | You want a focused AI session |
| You are debugging with frequent context switches | You have a well-defined multi-step plan |
| The task is contained to a few files | The task spans many files or systems |

Both tools can do most tasks. The choice often comes down to personal
preference and workflow style. Encourage engineers to try both and
find their own pattern.

---

## 6. Tool comparison matrix

| Capability | GitHub Copilot | Claude Code | Cursor |
|---|---|---|---|
| Inline completion | Excellent | None | Excellent |
| Single file generation | Good | Good | Good |
| Multi-file generation | Limited | Excellent | Good |
| Codebase understanding | Good (with instructions) | Excellent (with CLAUDE.md) | Good (with indexing) |
| Long context tasks | Limited | Excellent | Good |
| Agentic execution | Improving (agent mode) | Excellent | Good |
| Documentation generation | Good | Excellent | Good |
| Stays in IDE | Yes | No (CLI) | Yes |
| Privacy -- internal data | Approved (enterprise) | Approved | Approved |
| Privacy -- confidential data | Not approved | Approved (Azure hosted) | Review required |
| Cost | Per seat license | Per token (usage-based) | Per seat license |
| Setup via commons | copilot-instructions.md | CLAUDE.md | .cursorrules |

---

## 7. Data privacy and tool selection

Tool selection is not purely about capability -- it also depends on
the data classification of the content being processed.
See COMPLIANCE_STANDARDS.md section 3 for the full provider table.

| Data in the task | Approved tools | Not approved |
|---|---|---|
| Internal code with no PII | Copilot, Claude Code, Cursor | None |
| Code referencing personal data fields | Claude Code (Azure hosted) | Copilot, Cursor |
| Telecom subscriber data (CDR, IMSI) | On-premises models only | All three |
| Production credentials (never in prompts) | None -- see PRIVACY_GUARDRAILS.md | All |

When in doubt, use Claude Code via Azure OpenAI (Sweden Central)
which meets the highest data residency requirements for Telia.

---

## 8. Tool setup checklist

When a new engineer joins or a new project is created, complete
this setup in order:

```
Step 1 -- Install all three tools
  [ ] GitHub Copilot -- install VS Code extension, sign in with GitHub account
  [ ] Claude Code -- npm install -g @anthropic-ai/claude-code
  [ ] Cursor -- download from cursor.com, sign in

Step 2 -- Run aec init in the project repo
  [ ] cd {project-repo}
  [ ] npm install @telia-company/ai-engineering-common
  [ ] npx aec init
  [ ] Fill in .ai/project/ stub files
  [ ] npx aec update
  [ ] Commit generated configs

Step 3 -- Verify each tool reads the generated configs
  [ ] Copilot: open a file, check inline suggestions respect project patterns
  [ ] Claude Code: run 'claude' in repo root, ask "what project is this?"
      -- it should describe the project from CLAUDE.md
  [ ] Cursor: open repo in Cursor, check .cursorrules is loaded
      (Cursor shows "Rules applied" in the status bar)

Step 4 -- Complete onboarding exercises
  [ ] Use Copilot to write a simple function (L1 exercise)
  [ ] Use Claude Code to explain a module from MODULE_REGISTRY.md (L2 exercise)
  [ ] Use Cursor to debug a failing test (L2 exercise)
  [ ] Generate a unit test suite with Copilot or Cursor (L3 exercise)
```

---

## 9. Measuring tool effectiveness

The CoE tracks these metrics per tool to understand adoption and quality.
Champions report these to the CoE bi-weekly sync.

| Metric | Tool | How measured |
|---|---|---|
| Weekly active users | Copilot | GitHub Copilot usage dashboard |
| Acceptance rate | Copilot | % suggestions accepted vs dismissed |
| Lines of code generated | Copilot | GitHub Copilot usage dashboard |
| Sessions per week | Claude Code | Claude API usage (if on API plan) |
| Task completion rate | All | Engineer self-report in weekly survey |
| Rework rate after AI generation | All | PRs with "fix AI output" commits |

A high Copilot acceptance rate (above 30%) indicates engineers are
getting relevant suggestions -- the copilot-instructions.md is working.
A low acceptance rate suggests the instructions need tuning or engineers
are using Copilot for tasks where a different tool is better suited.

---

## 10. Version and review

| Attribute | Value |
|---|---|
| File owner | CoE Core |
| Review cadence | Quarterly -- or when new tools are adopted or approved |
| Last reviewed | 2025-01 |
| Next review due | 2025-04 |
| Approvers | CoE Lead |
| Change process | PR to ai-engineering-common, 2 CoE approvals required |
