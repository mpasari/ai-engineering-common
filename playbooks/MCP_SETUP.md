# MCP_SETUP.md
# Playbooks -- Jira and Confluence MCP setup for Claude Code
# Version: 1.0.0
# Status: Active
# Last updated: 2026-04
# Owner: CoE Core

---

## 1. What MCPs enable

Without MCPs, Claude Code can only read and write files locally.
With Jira and Confluence MCPs, Claude Code can:

```
Jira MCP:
  -- Read story ACs, descriptions, and comments
  -- Create stories, bugs, and tasks
  -- Update story fields (priority, component, labels)
  -- Add comments and transition statuses
  -- Search issues with JQL

Confluence MCP:
  -- Read existing pages (specs, ADRs, runbooks)
  -- Create new pages from templates
  -- Update existing pages
  -- Search spaces with CQL
```

This is what makes the agent commands actually work end-to-end.
Without MCPs, you describe the Jira story manually each time.
With MCPs, you type "WRITE_SPEC PROJ-412" and Claude Code reads the
story, ACs, and context automatically.

---

## 2. Prerequisites

```
[ ] Claude Code installed: npm install -g @anthropic-ai/claude-code
[ ] Node.js 18+ installed
[ ] Jira API token (see SECRETS_GUIDE.md section 4.1)
[ ] Confluence API token (same token as Jira)
[ ] .env file with credentials loaded (see SECRETS_GUIDE.md section 3)
```

---

## 3. Install the MCP servers

```powershell
# Install Jira MCP server
npm install -g @anthropic-ai/mcp-server-jira

# Install Confluence MCP server
npm install -g @anthropic-ai/mcp-server-confluence

# Install GitHub MCP server (for PR creation and review)
npm install -g @anthropic-ai/mcp-server-github

# Verify installations
npx @anthropic-ai/mcp-server-jira --version
npx @anthropic-ai/mcp-server-confluence --version
```

Note: MCP server package names may differ -- check
https://docs.anthropic.com/claude-code/mcp for the current
official package names. The pattern above is illustrative.

---

## 4. Configure MCP for Claude Code

Claude Code reads MCP configuration from `.mcp.json` in the
project root (project-level) or from `~/.claude/config.json` (global).

### 4.1 Project-level configuration (recommended)

Create `.mcp.json` in your project root. This file IS committed to git
because it contains no secrets -- only environment variable references.

```json
{
  "mcpServers": {
    "jira": {
      "command": "npx",
      "args": ["@anthropic-ai/mcp-server-jira"],
      "env": {
        "JIRA_BASE_URL": "${JIRA_BASE_URL}",
        "JIRA_EMAIL": "${JIRA_EMAIL}",
        "JIRA_API_TOKEN": "${JIRA_API_TOKEN}"
      }
    },
    "confluence": {
      "command": "npx",
      "args": ["@anthropic-ai/mcp-server-confluence"],
      "env": {
        "CONFLUENCE_BASE_URL": "${CONFLUENCE_BASE_URL}",
        "CONFLUENCE_EMAIL": "${CONFLUENCE_EMAIL}",
        "CONFLUENCE_API_TOKEN": "${CONFLUENCE_API_TOKEN}"
      }
    },
    "github": {
      "command": "npx",
      "args": ["@anthropic-ai/mcp-server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}",
        "GITHUB_ORG": "telia-company"
      }
    }
  }
}
```

### 4.2 Load environment variables before starting Claude Code

```powershell
# Load credentials from .env file
Get-Content .env | Where-Object { $_ -notmatch '^#' -and $_ -ne '' } | ForEach-Object {
    $name, $value = $_ -split '=', 2
    [System.Environment]::SetEnvironmentVariable($name.Trim(), $value.Trim(), 'Process')
}

# Then start Claude Code in the same session
claude
```

### 4.3 Verify MCPs are connected

Once Claude Code starts, verify the MCPs are working:

```
# Inside Claude Code session:
List my Jira projects

# Should respond with your Jira projects
# If it says it cannot access Jira -- check that:
# 1. Environment variables are loaded (echo $JIRA_API_TOKEN in terminal)
# 2. .mcp.json is in the project root
# 3. Claude Code was started after loading .env
```

---

## 5. Configure MCP for VS Code GitHub Copilot

GitHub Copilot does not natively support MCP servers. The workaround
is to use Copilot for inline code completion (its primary strength)
and Claude Code for agent tasks that require Jira/Confluence access.

The split workflow:

```
GitHub Copilot in VS Code:
  -- Inline code completion as you type
  -- Copilot Chat for quick questions and code generation
  -- Reads copilot-instructions.md automatically
  -- Best for: generating code, explaining code, small refactors

Claude Code (terminal):
  -- Full agent tasks with Jira/Confluence MCP
  -- Best for: WRITE_SPEC, TRIAGE_BUG, REVIEW_PR, VALIDATE_STORY
  -- Run in the VS Code integrated terminal alongside Copilot
```

You use both simultaneously -- Copilot for the keyboard, Claude Code
for the agentic workflows. They share the same CLAUDE.md context.

---

## 6. Configure MCP for Cursor

Cursor supports MCP servers natively via its settings.

### 6.1 Cursor MCP configuration

1. Open Cursor Settings (Ctrl+Shift+J / Cmd+Shift+J)
2. Search for "MCP" in settings
3. Add server configuration:

```json
// Cursor settings.json -- MCP section
{
  "cursor.mcp.servers": {
    "jira": {
      "command": "npx",
      "args": ["@anthropic-ai/mcp-server-jira"],
      "env": {
        "JIRA_BASE_URL": "${env:JIRA_BASE_URL}",
        "JIRA_EMAIL": "${env:JIRA_EMAIL}",
        "JIRA_API_TOKEN": "${env:JIRA_API_TOKEN}"
      }
    },
    "confluence": {
      "command": "npx",
      "args": ["@anthropic-ai/mcp-server-confluence"],
      "env": {
        "CONFLUENCE_BASE_URL": "${env:CONFLUENCE_BASE_URL}",
        "CONFLUENCE_EMAIL": "${env:CONFLUENCE_EMAIL}",
        "CONFLUENCE_API_TOKEN": "${env:CONFLUENCE_API_TOKEN}"
      }
    },
    "github": {
      "command": "npx",
      "args": ["@anthropic-ai/mcp-server-github"],
      "env": {
        "GITHUB_TOKEN": "${env:GITHUB_TOKEN}",
        "GITHUB_ORG": "telia-company"
      }
    }
  }
}
```

The `${env:VARIABLE_NAME}` syntax reads from system environment
variables. Set these permanently:

```powershell
# Set as permanent user environment variables (survives restarts)
[System.Environment]::SetEnvironmentVariable("JIRA_BASE_URL", "https://telia-company.atlassian.net", "User")
[System.Environment]::SetEnvironmentVariable("JIRA_EMAIL", "your.email@telia.com", "User")
[System.Environment]::SetEnvironmentVariable("JIRA_API_TOKEN", "your_token_here", "User")
[System.Environment]::SetEnvironmentVariable("CONFLUENCE_BASE_URL", "https://telia-company.atlassian.net/wiki", "User")
[System.Environment]::SetEnvironmentVariable("CONFLUENCE_EMAIL", "your.email@telia.com", "User")
[System.Environment]::SetEnvironmentVariable("CONFLUENCE_API_TOKEN", "your_token_here", "User")
[System.Environment]::SetEnvironmentVariable("GITHUB_TOKEN", "ghp_your_token", "User")
```

Restart Cursor after setting environment variables.

### 6.2 Verify Cursor MCP connection

In Cursor Composer (Ctrl+I / Cmd+I):

```
# Test Jira connection
Read the Jira story PROJ-1 and summarise it

# Test Confluence connection
List the pages in the ENG Confluence space

# If either fails, check Cursor > Output > MCP for error messages
```

---

## 7. Testing the full setup

Run this sequence to verify the complete setup is working:

```
Step 1: Load environment
  PowerShell: source .env (or use permanent env vars for Cursor)

Step 2: Open Claude Code in your project terminal
  claude

Step 3: Test Jira read
  "Read the Jira story [REAL-STORY-KEY] and tell me its acceptance criteria"
  Expected: Claude reads the story and lists the ACs

Step 4: Test Confluence read
  "Find the technical spec page for [feature name] in Confluence"
  Expected: Claude finds and summarises the spec

Step 5: Test GitHub read
  "List the open pull requests in [repo-name]"
  Expected: Claude lists the PRs

Step 6: Run a real command
  "TRIAGE_BUG [REAL-BUG-KEY]"
  Expected: Claude reads the bug, checks KEDB, adds triage comment to Jira
```

---

## 8. Troubleshooting

| Problem | Likely cause | Fix |
|---|---|---|
| "Cannot access Jira" | Token not loaded | Verify env var: echo $JIRA_API_TOKEN |
| "Permission denied" | Wrong Jira permissions | Token must have read/write access to the project |
| MCP server not starting | Package not installed | npm install -g @anthropic-ai/mcp-server-jira |
| Cursor MCP not connecting | Env vars not set as system vars | Set via [System.Environment]::SetEnvironmentVariable |
| Claude reads wrong space | Wrong CONFLUENCE_BASE_URL | Should end in /wiki not /wiki/spaces |

---

## 9. Version and review

| File owner | CoE Core |
| Review cadence | Quarterly -- MCP APIs evolve |
| Approvers | CoE Lead |
