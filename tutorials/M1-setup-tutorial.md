# M1 — Environment Setup Tutorial
# AI Engineering Commons — Champions Programme
# Version: 1.1
# Last updated: 2026-05-14
# Prerequisite: VS Code installed

---

## What you will achieve by the end of this tutorial

By the end of M1 you will have:
- GitHub Copilot Chat configured in Agent mode with file editing enabled
- Jira MCP connected and verified (you can ask questions about your Jira tickets)
- Confluence MCP connected and verified (you can ask questions about Confluence pages)
- All tools set to auto-enable so you never have to configure this again

**Time to complete:** 20-30 minutes
**Difficulty:** Beginner
**Next milestone:** M2 — Greenfield Tutorial

---

## Why this matters

MCP (Model Context Protocol) is what connects GitHub Copilot to your real work systems.
Without MCP, Copilot is a general-purpose AI that knows nothing about your Jira tickets,
your Confluence documentation, or your team's work.

With MCP connected, Copilot becomes your personal assistant that can:
- Read and create Jira stories in your project
- Search and read Confluence pages
- Cross-reference your codebase with your real backlog

M1 is the foundation. Every other milestone builds on top of it.

---

## Step 1 — Verify GitHub Copilot Chat is installed

**What to do:**
1. Open VS Code
2. Press `Ctrl+Shift+X` to open the Extensions panel
3. Search for "GitHub Copilot Chat"

**What you should see:**
GitHub Copilot Chat by GitHub listed in the results.
When it is installed, you will see a **settings cogwheel icon** next to it
and a **Disable** button -- there is no Install button because it is already installed.

If you see a blue **Install** button instead -- click it to install.
When the installation finishes, restart VS Code.

**Why this step:**
GitHub Copilot Chat is the interface we use to talk to the AI agents.
Without it, none of the commands (/draft-brief, /run-brownfield-scan etc.) will work.

---

## Step 2 — Open a PowerShell terminal and create a workspace folder

### What is PowerShell?

PowerShell is the command line tool built into Windows. It lets you run commands
to create folders, install software, and manage files -- all by typing instructions
instead of clicking through menus.

You can open it in two ways:

**Option A -- Open PowerShell inside VS Code (recommended):**
1. In VS Code, click **Terminal** in the top menu bar
2. Click **New Terminal**
3. A terminal panel opens at the bottom of VS Code
4. Look at the top right corner of the terminal panel
5. If it does not already show **PowerShell**, click the small dropdown arrow next to the `+` button
6. Select **PowerShell** from the list

Note: There is a keyboard shortcut for opening the terminal but the key used
varies on every keyboard layout (Norwegian, Swedish, Finnish, Lithuanian, Estonian, English).
Using the menu above is the safest approach and works the same for everyone.

**Option B -- Open PowerShell from Windows:**
1. Press the Windows key
2. Type: `PowerShell`
3. Click **Windows PowerShell** to open it

**What you should see:**
A dark panel with a prompt ending in `>` such as:
```
PS C:\Users\yourname>
```

### Create the workspace folder

Once PowerShell is open, type these commands one at a time and press Enter after each:

```powershell
mkdir C:\Projects\ai-workspace
cd C:\Projects\ai-workspace
code .
```

**What each command does:**
- `mkdir C:\Projects\ai-workspace` -- creates a new folder called `ai-workspace` inside `C:\Projects`
- `cd C:\Projects\ai-workspace` -- moves you into that folder
- `code .` -- opens VS Code in that folder (the dot means "this folder")

**What you should see:**
VS Code opens (or refreshes) showing an empty Explorer panel on the left
with the folder name `ai-workspace` at the top.

---

## Step 3 — Create the MCP configuration file

**What to do:**
1. In the VS Code Explorer panel on the left, click the **New Folder** icon
   (it looks like a folder with a small + symbol)
2. Name the folder: `.vscode` and press Enter
3. Click inside `.vscode` to select it
4. Click the **New File** icon (it looks like a page with a small + symbol)
5. Name the file: `mcp.json` and press Enter
6. Click `mcp.json` to open it in the editor
7. Paste this content exactly:

```json
{
  "servers": {
    "confluence-mcp": {
      "url": "https://confluence-mcp.backstage.teliacompany.net",
      "type": "http"
    },
    "jira-mcp": {
      "url": "https://jira-mcp.backstage.teliacompany.net",
      "type": "http"
    }
  }
}
```

8. Save with `Ctrl+S`

**What you should see:**
The file saves with no red underlines anywhere in the content.
The tab at the top of the editor should show `mcp.json` without a dot
(a dot means unsaved changes).

**Why this step:**
This file tells VS Code which MCP servers exist and where to find them.
`confluence-mcp.backstage.teliacompany.net` and `jira-mcp.backstage.teliacompany.net`
are Telia's internal MCP servers. They bridge Copilot to your Atlassian systems.

---

## Step 4 — Configure VS Code settings for Agent mode

**What to do:**
1. Press `Ctrl+Shift+P` -- a search bar opens at the top of VS Code
2. Type: `Open User Settings JSON`
3. Press Enter
4. The file `settings.json` opens in the editor

**What you should see:**
A file containing your existing VS Code settings, wrapped in `{  }` curly braces.
It might look something like:
```json
{
    "editor.fontSize": 14,
    "workbench.colorTheme": "Dark+"
}
```

5. Find the last line before the closing `}` at the very bottom
6. Add a comma `,` at the end of that last line if there is not one already
7. Add these new lines before the closing `}`:

```json
"github.copilot.chat.agent.fileEditing": true,
"github.copilot.chat.agent.runTasks": true,
"github.copilot.chat.agent.defaultTools": [
    "edit",
    "execute",
    "read",
    "search",
    "confluence-mcp",
    "jira-mcp"
]
```

8. Save with `Ctrl+S`

**What a correctly formatted settings.json looks like:**
```json
{
    "editor.fontSize": 14,
    "workbench.colorTheme": "Dark+",
    "github.copilot.chat.agent.fileEditing": true,
    "github.copilot.chat.agent.runTasks": true,
    "github.copilot.chat.agent.defaultTools": [
        "edit",
        "execute",
        "read",
        "search",
        "confluence-mcp",
        "jira-mcp"
    ]
}
```

**What you should see:**
No red underlines anywhere in the file.
If you see red underlines, the JSON is invalid -- check that every line
except the last one inside the `{  }` ends with a comma.

**Why each setting:**

| Setting | Why it is needed |
|---|---|
| `fileEditing: true` | Allows Copilot to create and edit files in your project. Without this, Copilot shows file content in chat but cannot save it to disk. |
| `runTasks: true` | Allows Copilot to run terminal commands (tests, builds, git commands). |
| `defaultTools` | Tells Copilot which tools to enable automatically in every new chat session. Without this list, you have to manually toggle confluence-mcp and jira-mcp ON every single time you open a new chat. |

---

## Step 5 — Trust the workspace

**What to do:**
1. Press `Ctrl+Shift+P`
2. Type: `Workspaces: Manage Workspace Trust`
3. Press Enter

**What you should see:**
A page showing two columns: "In a Trusted Folder" on the left (with green checkmarks)
and "In Restricted Mode" on the right (with red X marks).
Below that is a list of Trusted Folders.

4. Look for `C:\Projects\ai-workspace` in the trusted folders list
5. If it is not there, click **Add Folder** and navigate to `C:\Projects\ai-workspace`

**What you should see after:**
Your folder path listed in bold under "Trusted Folders & Workspaces".

**Why this step:**
VS Code restricts what extensions can do in untrusted folders.
If your workspace is not trusted, Copilot Agent mode cannot write files or run commands
even if you have `fileEditing: true` in settings.
This is a common cause of silent failures where Copilot shows content in chat
but the file never appears on disk.

---

## Step 6 — Open Copilot Chat in Agent mode

**What to do:**
1. Press `Ctrl+Alt+I`
2. The Copilot Chat panel opens on the right side of VS Code
3. At the bottom of the chat input box, look for a dropdown showing a mode name
   (it may say "Ask", "Edit", or "Agent")
4. Click the dropdown and select **Agent**

**What you should see:**
The Copilot Chat panel is open on the right.
The mode dropdown at the bottom shows **Agent**.
The input box shows placeholder text like "Describe what to build" or "Ask Copilot".

**Why Agent mode:**
There are three modes in Copilot Chat:
- **Ask** -- answers questions but cannot take actions
- **Edit** -- edits code files you specify manually
- **Agent** -- reads files, calls MCP tools, writes files, runs commands

We always use Agent mode because it is the only mode that can call Jira and Confluence.

---

## Step 7 — Start the MCP servers

**What to do:**
1. Press `Ctrl+Shift+P`
2. Type: `MCP: List Servers`
3. Press Enter
4. A dropdown appears listing `confluence-mcp` and `jira-mcp`
5. Click `confluence-mcp`

**What you should see next:**
A VS Code dialog box appears saying:

> "The MCP Server Definition 'confluence-mcp' wants to authenticate to
> confluence-mcp.backstage.teliacompany.net"

6. Click **Allow**
7. Your default browser opens automatically
8. Sign in with your Telia credentials if the browser asks you to log in
9. After signing in, the browser may show a success message or redirect
10. Return to VS Code

**What you should see in VS Code after:**
Go to `View → Output` and select **MCP: confluence-mcp** from the dropdown.
You should see:
```
[info] Connection state: Running
[info] Discovered 31 tools
```

11. Repeat for jira-mcp:
    Press `Ctrl+Shift+P → MCP: List Servers → click jira-mcp → Allow`

---

## Step 7 troubleshooting — "Client Not Registered" error

If your browser shows this page after clicking Allow:

> **Client Not Registered**
> The client ID xxx was not found in the server's client registry.

**What to do:**
1. Close the browser tab
2. Close VS Code completely (`File → Exit`)
3. Reopen VS Code
4. Reopen your project folder
5. Press `Ctrl+Shift+P → MCP: List Servers`
6. Click the server name again
7. Click **Allow**

The browser will open again. This time the authentication should complete
successfully and show a confirmation message instead of the error.

**Why this happens:**
The MCP client generates a new registration ID on first connection.
VS Code stores this ID in an internal database. If the first connection
attempt fails, the old ID gets cached and reused on every subsequent
attempt -- causing the same error to repeat even after restarting VS Code.

**If the error appears again after restarting VS Code:**

The cached ID is stored in VS Code's internal state database.
You need to delete it so VS Code generates a fresh ID.

1. Close VS Code completely
2. Open PowerShell (from the Windows start menu)
3. Run these commands one at a time:

```powershell
Stop-Process -Name "Code" -Force -ErrorAction SilentlyContinue

Remove-Item "$env:APPDATA\Code\User\globalStorage\state.vscdb" -Force
Remove-Item "$env:APPDATA\Code\User\globalStorage\state.vscdb.backup" -Force

Test-Path "$env:APPDATA\Code\User\globalStorage\state.vscdb"
```

The last command should return **False** -- confirming the file is deleted.

4. Reopen VS Code:

```powershell
cd C:\Projects\ai-workspace
code .
```

5. Try again: `Ctrl+Shift+P → MCP: List Servers → confluence-mcp → Allow`

VS Code will create a fresh database with no cached client ID.
The browser should now show the Telia login page instead of the error.

**Note:** Deleting state.vscdb is safe. VS Code recreates it automatically
on next launch. You will not lose any settings or extensions.

---

## Step 8 — Verify the tools are active in the chat session

**What to do:**
1. In the Copilot Chat panel, look at the bottom of the chat input box
2. Click the **tools icon** -- it looks like a spanner or two small wrenches
3. A panel opens showing all available tools

**What you should see:**
A list of tools with checkboxes. Verify these are checked (toggled ON):
- `edit`
- `execute`
- `read`
- `search`
- `confluence-mcp`
- `jira-mcp`

4. If any are unchecked, click to toggle them ON
5. Click **OK** to close the panel

**Why this step:**
This is your pre-flight check before every session.
Even with `defaultTools` configured, it is worth verifying the first time
to confirm everything is working as expected.

---

## Step 9 — Verify Confluence MCP is working

**What to do:**
Type this in the Copilot Chat input and press Enter:

```
@confluence-mcp search for pages in space ECA
```

**What you should see:**
Copilot calls the Confluence MCP and returns a list of pages from the ECA space.
You will see a line like:
```
Ran search_content — confluence-mcp (MCP Server)
```
Followed by a list of page names from the ECA Confluence space.

**If you see this — Confluence MCP is working. ✓**

**If you see a generic Copilot response with no MCP tool call:**
Check that confluence-mcp shows as Running in `View → Output → MCP: confluence-mcp`.

---

## Step 10 — Verify Jira MCP is working

**What to do:**
Type this in the chat and press Enter:

```
@jira-mcp get my issues
```

**What you should see:**
Copilot calls the Jira MCP and returns a list of Jira issues assigned to you.
You will see a line like:
```
Ran jira_search — jira-mcp (MCP Server)
```
Followed by a list of your Jira issues.

**If you see this — Jira MCP is working. ✓**

---

## Step 11 — Mark your M1 milestone

**What to do:**
1. Open the Champions Register in Confluence:
   https://itwiki.atlassian.teliacompany.net/spaces/ECA/pages/1279990780
2. Find your name in the table
3. Click **Edit** on the page
4. Add `✓ (May-26)` in your M1 Setup column
5. Click **Save**

**You have completed M1. ✓**

---

## Summary of what you configured

| What | Where | Why |
|---|---|---|
| mcp.json | .vscode/mcp.json in your project | Tells VS Code where the MCP servers are |
| fileEditing | User settings.json | Lets Copilot write files to disk |
| runTasks | User settings.json | Lets Copilot run terminal commands |
| defaultTools | User settings.json | Auto-enables Jira and Confluence every session |
| Workspace trust | VS Code workspace settings | Allows all features in this folder |

---

## What to do if you get stuck

1. Check the Output panel: `View → Output → MCP: confluence-mcp`
   Look for error messages
2. Verify settings.json has no red underlines (invalid JSON breaks everything)
3. Verify the workspace is trusted (Step 5)
4. Post in the AI Champions CoE Teams channel with a screenshot of what you see
5. Contact your CoE champion directly

---

## Next step

You are now ready for **M2 — Greenfield Tutorial**.

In M2 you will use the Party Management demo project to run the full journey
from a rough idea to Jira epics and stories with acceptance criteria
-- all using AI slash commands.

**M2 tutorial:** M2-greenfield-tutorial.md
**Demo project:** github.com/telia-company/ai-engineering-commons-demo
