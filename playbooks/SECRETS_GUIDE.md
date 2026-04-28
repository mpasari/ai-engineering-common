# SECRETS_GUIDE.md
# Playbooks -- How to manage credentials and environment variables
# Version: 1.0.0
# Status: Active
# Last updated: 2026-04
# Owner: CoE Core

---

## 1. The rule

**No credentials, tokens, or passwords ever go in git.**

This applies to: source code, configuration files, .env files,
test fixtures, comments, commit messages, and any file that is
or could be tracked by git.

---

## 2. What counts as a secret

```
Always a secret:
  -- Passwords and API keys
  -- OAuth client secrets
  -- JWT signing keys
  -- Database connection strings with credentials
  -- GitHub Personal Access Tokens (PATs)
  -- Azure service principal credentials
  -- Jira / Confluence API tokens
  -- ANTHROPIC_API_KEY or any AI provider key
  -- Kafka SASL credentials
  -- Any string that starts with ghp_, sk_, AKIA, xox

Not a secret:
  -- Public URLs (https://jira.telia.com)
  -- Usernames without passwords
  -- Jira project keys (PROJ, ORDER)
  -- Non-sensitive configuration (feature flags set to true/false)
```

---

## 3. Local development -- the .env pattern

For local development, credentials go in a `.env` file that is
**never committed to git**.

### 3.1 Create a .env file (not committed)

```bash
# .env  -- LOCAL ONLY, never commit this file
# Copy .env.example and fill in real values

# GitHub Packages authentication
GITHUB_TOKEN=ghp_your_token_here

# Jira MCP credentials
JIRA_BASE_URL=https://telia-company.atlassian.net
JIRA_EMAIL=your.email@telia.com
JIRA_API_TOKEN=your_jira_api_token_here

# Confluence MCP credentials
CONFLUENCE_BASE_URL=https://telia-company.atlassian.net/wiki
CONFLUENCE_EMAIL=your.email@telia.com
CONFLUENCE_API_TOKEN=your_confluence_api_token_here

# Anthropic (Claude Code)
ANTHROPIC_API_KEY=sk-ant-your_key_here

# Test environment
TEST_ENV_BASE_URL=http://localhost:8080
TEST_USER_PASSWORD=test-password-local-only
```

### 3.2 Create a .env.example file (committed)

```bash
# .env.example  -- Committed to git. Shows structure, never real values.
# Copy this to .env and fill in your values.
# Get credentials from: https://telia-company.atlassian.net/wiki/...

GITHUB_TOKEN=
JIRA_BASE_URL=https://telia-company.atlassian.net
JIRA_EMAIL=
JIRA_API_TOKEN=
CONFLUENCE_BASE_URL=https://telia-company.atlassian.net/wiki
CONFLUENCE_EMAIL=
CONFLUENCE_API_TOKEN=
ANTHROPIC_API_KEY=
TEST_ENV_BASE_URL=http://localhost:8080
TEST_USER_PASSWORD=
```

### 3.3 Add .env to .gitignore

```
# In .gitignore -- verify this is present before every commit
.env
.env.local
.env.*.local
*.secret
```

### 3.4 Load .env in your shell session

```powershell
# PowerShell -- load .env into current session
Get-Content .env | Where-Object { $_ -notmatch '^#' -and $_ -ne '' } | ForEach-Object {
    $name, $value = $_ -split '=', 2
    [System.Environment]::SetEnvironmentVariable($name.Trim(), $value.Trim(), 'Process')
}
Write-Host "Environment variables loaded"

# Verify a specific variable is set
$env:JIRA_API_TOKEN.Substring(0,4) + "****"  # Should print first 4 chars
```

```bash
# Bash/zsh (Mac/Linux)
set -a; source .env; set +a
echo "Loaded -- JIRA_API_TOKEN is ${JIRA_API_TOKEN:0:4}****"
```

---

## 4. Getting the credentials you need

### 4.1 Jira API token

1. Go to: https://id.atlassian.com/manage-profile/security/api-tokens
2. Click "Create API token"
3. Label: "AI Engineering Common -- [your name]"
4. Copy the token immediately -- it is only shown once
5. Store in your `.env` file as `JIRA_API_TOKEN`

### 4.2 Confluence API token

Same token as Jira -- Atlassian uses one token for both services.
`JIRA_API_TOKEN` and `CONFLUENCE_API_TOKEN` can be the same value.

### 4.3 GitHub Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Scopes: `read:packages`, `write:packages`, `repo`
4. Label: "AI Engineering Common"
5. Copy and store as `GITHUB_TOKEN`

### 4.4 Anthropic API key (for Claude Code)

Claude Code manages its own authentication via `claude login` -- you
do not need to set `ANTHROPIC_API_KEY` manually for Claude Code.

For any custom scripts or integrations that call the Anthropic API
directly: get a key from console.anthropic.com and store in `.env`.

---

## 5. CI/CD -- GitHub Actions secrets

In CI pipelines, credentials are stored as GitHub Actions secrets,
not in workflow files.

### 5.1 Set a GitHub Actions secret

1. Go to your repository on GitHub
2. Settings > Secrets and variables > Actions
3. Click "New repository secret"
4. Name: `JIRA_API_TOKEN` (match the name in your .env)
5. Value: paste the token

Required secrets for the standard CI pipeline:

```
GITHUB_TOKEN          -- Auto-provided by GitHub Actions (do not create manually)
JIRA_API_TOKEN        -- For agents that create/update Jira tickets
CONFLUENCE_API_TOKEN  -- For agents that create/update Confluence pages
NVD_API_KEY           -- For OWASP Dependency Check (get from nvd.nist.gov/developers)
```

### 5.2 Reference secrets in workflow files

```yaml
# In .github/workflows/ci.yml -- reference secrets, never hardcode
- name: Run security scan
  env:
    JIRA_API_TOKEN: ${{ secrets.JIRA_API_TOKEN }}
    NVD_API_KEY: ${{ secrets.NVD_API_KEY }}
  run: ./mvnw dependency-check:check
```

---

## 6. MCP server credentials

MCP servers for Claude Code read credentials from environment variables.
The MCP configuration file (`.mcp.json` or `claude_desktop_config.json`)
references environment variable names -- it never contains the values.

```json
// .mcp.json -- COMMITTED to git (contains no secrets)
{
  "mcpServers": {
    "jira": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-jira"],
      "env": {
        "JIRA_BASE_URL": "${JIRA_BASE_URL}",
        "JIRA_EMAIL": "${JIRA_EMAIL}",
        "JIRA_API_TOKEN": "${JIRA_API_TOKEN}"
      }
    },
    "confluence": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-confluence"],
      "env": {
        "CONFLUENCE_BASE_URL": "${CONFLUENCE_BASE_URL}",
        "CONFLUENCE_EMAIL": "${CONFLUENCE_EMAIL}",
        "CONFLUENCE_API_TOKEN": "${CONFLUENCE_API_TOKEN}"
      }
    }
  }
}
```

The `${VARIABLE_NAME}` syntax tells the MCP client to read the value
from the current process environment -- which you loaded from `.env`
using the commands in section 3.4.

---

## 7. Verifying nothing sensitive is committed

Before every PR, run a secrets scan:

```powershell
# Using Trufflehog (if installed locally)
trufflehog filesystem --only-verified .

# Using git log to check recent commits
git log --all --format="%H %s" | head -20
# Then for any suspicious commit: git show [hash] -- check for credentials
```

If you accidentally committed a secret:

```
1. Rotate the credential immediately (assume it is compromised)
2. Remove it from the code
3. If in a public repo: contact Security Lead -- the token is exposed in git history
   even after you remove it from the latest commit
4. For private repos: git history rewrite may be required (ask Security Lead)
```

---

## 8. Version and review

| File owner | CoE Core + Security Lead |
| Review cadence | Quarterly |
| Approvers | Security Lead, CoE Lead |
