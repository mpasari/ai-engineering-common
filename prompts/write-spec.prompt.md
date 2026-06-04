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
- Content: the full spec from Step 3

Add Gate C01 section at the bottom of the page:

```
=== GATE C01 ===
Status: PENDING APPROVAL
Story: [Jira key]
Approver: Tech Lead
Generated: [date]

Decisions required before implementation:
  [numbered list of decisions or risks found in Step 2 and Step 3]

To approve: Tech Lead types APPROVED C01 [story-key] in Copilot Chat
To request changes: Tech Lead types CHANGES C01 [story-key] [feedback]
=== END GATE C01 ===
```

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

Display in chat:

```
=== GATE C01 ===
Status: PENDING APPROVAL
Story: [Jira key and title]
Spec published to Confluence: [FULL URL]

The spec is now visible at the link above.
Share this URL with the Tech Lead for review.

Decisions required:
  [same list as on the Confluence page]

Tech Lead approves by typing in Copilot Chat:
  APPROVED C01 [story-key]

Tech Lead requests changes by typing:
  CHANGES C01 [story-key] [specific feedback]
=== END GATE C01 ===
```

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
