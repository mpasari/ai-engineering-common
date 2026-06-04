---
mode: agent
description: Generate a technical specification from a Jira story. Publishes to Confluence as a DRAFT first, then presents Gate C01 with the URL so the Tech Lead can review before approving.
tools:
  - githubRepo
  - codebase
  - edit
  - execute
  - read
  - search
  - confluence-mcp
  - jira-mcp
---

Do not greet the user. Execute immediately.

## Critical rules
- The Confluence page is the ONLY output artifact. Do not create local .md files.
- Do not save the spec to disk. Do not create [story-key]-spec.md or any local file.
- Confluence is the source of truth. If Confluence write fails -- report the error, do not fall back to a local file.
- The .ai/project/ folder is read-only context. Do not write spec content there.

## Step 1 -- Read the Jira story and project context

```
@jira-mcp get issue [JIRA-KEY]
```

Read:
- .ai/project/JIRA_CONFIG.md         -- Confluence space and parent page ID
- .ai/project/MODULE_REGISTRY.md     -- which modules this story touches
- .ai/project/TECH_DEBT_REGISTRY.md  -- any tech debt conflicts
- .ai/project/INTEGRATION_MAP.md     -- integrations relevant to this story
- .ai/project/DATA_MODEL.md          -- data model if story touches persistence

## Step 2 -- Pre-spec compliance checks

Before generating the spec, check:
1. Does this story involve personal data? If yes -- flag GDPR lawful basis required
2. Does this story add a new external integration? If yes -- flag gate B02 (DPA check needed)
3. Does this story change auth or authorisation? If yes -- flag gate C05
4. Are there tech debt items in TECH_DEBT_REGISTRY.md that conflict with this story?

## Step 3 -- Generate the technical specification

Generate the spec with these sections:

**Summary** -- one sentence business description

**Scope**
- In scope: [list]
- Out of scope: [list]

**Acceptance criteria**
Copy verbatim from the Jira story. Do not paraphrase.

**Technical approach**
- Module affected (from MODULE_REGISTRY.md)
- Key classes or components to create or modify
- Data flow description

**API changes** (if applicable)
- Endpoint, method, request schema, response schema
- Error responses
- Breaking change: yes/no

**Data model changes** (if applicable)
- Tables created or modified
- For every column containing personal data:
  GDPR classification, lawful basis, retention period
- Migration approach

**Security considerations**
- Authentication required: yes/no and which roles
- Input validation rules
- PII handling notes

**Non-functional requirements**
- Performance targets
- Test approach

**Tech debt conflicts**
- List any TECH_DEBT_REGISTRY.md items that affect this story
- State whether they must be resolved before or can be resolved alongside

## Step 4 -- Publish to Confluence as DRAFT

Read the Confluence space and parent page from JIRA_CONFIG.md.

Create a Confluence page with:
- Space:   [value from JIRA_CONFIG.md Confluence space field]
- Parent:  [value from JIRA_CONFIG.md Confluence parent field]
- Title:   DRAFT: SPEC: [story-key] -- [story-summary]
- Status:  DRAFT (prefix title with DRAFT: to make status visible)

IMPORTANT: The Confluence MCP uses storage format (XHTML) not wiki markup.
Do NOT use wiki syntax -- h2., *, #, {{code}}, {panel} -- they render as literal text.
Use plain HTML elements for all formatting:

- Headings:       <h2>Section</h2> and <h3>Subsection</h3>
- Bullet lists:   <ul><li>item</li><li>item</li></ul>  -- each item its own <li>
- Numbered lists: <ol><li>item</li><li>item</li></ol>  -- each item its own <li>
- Inline code:    <code>ClassName</code>
- Code blocks:    <pre>multi-line code here</pre>
- Bold:           <strong>label</strong>
- Tables:         <table><tr><th>header</th><td>value</td></tr></table>

NEVER write a list as a single paragraph. Each bullet point is a separate <li> element.

Add Gate C01 section at the bottom of the page.

The Confluence MCP submits content as storage format (XHTML), not wiki markup.
Use this exact HTML structure for the Gate C01 block -- do not use {panel} or wiki macros:

<h2>⏸ Gate C01 — Tech Lead Review Required</h2>
<table>
  <tbody>
    <tr><th>Status</th><td><strong>PENDING APPROVAL</strong></td></tr>
    <tr><th>Story</th><td>[story-key] — [story-title]</td></tr>
    <tr><th>Approver</th><td>Tech Lead</td></tr>
    <tr><th>Generated</th><td>[date]</td></tr>
  </tbody>
</table>
<h3>Decisions required before implementation</h3>
<ol>
  <li>[decision or risk 1]</li>
  <li>[decision or risk 2]</li>
  <li>[decision or risk 3]</li>
</ol>
<h3>To approve</h3>
<p>Tech Lead opens Copilot Chat in VS Code and types:</p>
<pre>APPROVED C01 [story-key]</pre>
<h3>To request changes</h3>
<pre>CHANGES C01 [story-key] [specific feedback]</pre>

## Step 5 -- Update Jira story

Update the Jira story:
1. Add a remote link to the Confluence page with label "Technical Spec"
2. Add a comment:

```
Technical specification published for Gate C01 review.

Confluence spec: [URL]

Tech Lead: please review the spec at the link above.
When satisfied, open Copilot Chat and type:
APPROVED C01 [story-key]

Or to request changes:
CHANGES C01 [story-key] [your specific feedback]
```

3. Apply label: ai-generated-spec

## Step 6 -- Present Gate C01 in chat WITH the URL

Display in chat using this exact format:

---
⏸ **GATE C01 — PENDING APPROVAL**

**Story:** [story-key] -- [story-title]
**Spec:** [FULL Confluence URL]

The spec is published to Confluence as a DRAFT.
Share the URL above with the Tech Lead for review.

**Decisions required before implementation:**
1. [decision 1]
2. [decision 2]
3. [decision 3]

**Tech Lead approves by typing in Copilot Chat:**
`APPROVED C01 [story-key]`

**Tech Lead requests changes by typing:**
`CHANGES C01 [story-key] [specific feedback]`

---

Stop and wait. Do not proceed to code generation until APPROVED C01 is received.

## Step 7 -- On APPROVED C01

When Tech Lead types APPROVED C01 [story-key]:

1. Update the Confluence page:
   - Remove DRAFT: prefix from the page title
   - Update Gate C01 section status to APPROVED
   - Add: Approved by [name] on [date]

2. Update the Jira story:
   - Add comment: "Gate C01 APPROVED on [date]. Ready for /generate-code."
   - Apply label: ai-reviewed

3. Tell the engineer:
   "Gate C01 approved. Confluence page updated to APPROVED status.
   Next step: /generate-code [story-key]"

## Step 8 -- On CHANGES C01

When Tech Lead types CHANGES C01 [story-key] [feedback]:

1. Read the feedback carefully
2. Update the spec sections that address the feedback
3. Update the Confluence page with the revised content
4. Update the Gate C01 section: status back to PENDING APPROVAL, add changes note
5. Present Gate C01 again with the same URL
6. Add Jira comment: "Spec revised based on Tech Lead feedback. Gate C01 re-presented."
