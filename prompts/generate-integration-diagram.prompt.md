---
mode: agent
description: Generate an integration diagram from INTEGRATION_MAP.md. Saves a Mermaid diagram to docs/architecture/INTEGRATION_DIAGRAM.md (rendered automatically in GitHub) and publishes a structured readable version to Confluence. Run again after INTEGRATION_MAP.md changes to keep both in sync.
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

Do not greet. Execute immediately.

## Rules
- INTEGRATION_MAP.md is the single source of truth. Do not invent integrations.
- Do not create local spec files. Repo artifact + Confluence page are the only outputs.
- If INTEGRATION_MAP.md contains placeholder values -- generate what is there and flag placeholders.
- Read Confluence space and parent page from JIRA_CONFIG.md.

## Step 1 -- Read source data

Read:
- .ai/project/INTEGRATION_MAP.md         (primary source)
- .ai/project/ARCHITECTURE_OVERVIEW.md   (system name and purpose)
- .ai/project/JIRA_CONFIG.md             (Confluence target)
- .ai/project/KAFKA_TOPICS.md            (if exists -- add Kafka flows)

Parse every integration entry. For each extract:
- System name
- Direction: inbound / outbound / both
- Protocol: REST / Kafka / SOAP / gRPC / SMTP / SMPP / database / other
- Auth method: OAuth2 / API key / mTLS / Azure managed identity / none
- Purpose: what data flows and why
- DPA status: Yes / No / Unknown
- SLA: if documented

Build two lists:
- OUTBOUND: systems this product calls
- INBOUND: systems that call this product

## Step 2 -- Generate Mermaid diagram (repo artifact)

Save to docs/architecture/INTEGRATION_DIAGRAM.md.
Create docs/architecture/ if it does not exist.

The diagram uses Mermaid flowchart syntax which renders automatically in GitHub.

```markdown
# Integration Diagram
# System: [from ARCHITECTURE_OVERVIEW.md]
# Generated: [date] | Source: .ai/project/INTEGRATION_MAP.md
# Update: run /generate-integration-diagram after changing INTEGRATION_MAP.md

---

## Integration Map

```mermaid
flowchart LR
    %% Style definitions
    classDef system fill:#190029,stroke:#9B1FE8,color:#F4ECFB
    classDef external fill:#0D1B2A,stroke:#00B0B9,color:#F4ECFB
    classDef kafka fill:#0D2010,stroke:#22C55E,color:#F4ECFB
    classDef internal fill:#2A0845,stroke:#B85CFF,color:#F4ECFB

    %% Core system node
    SYSTEM["[System name]
    ─────────────
    [brief purpose]"]:::system

    %% Outbound integrations
    [For each outbound integration:]
    EXT_NAME["[System name]
    ─────────────
    [Protocol] | [Auth]"]:::external
    SYSTEM -->|"[Protocol]
    [Purpose summary]"| EXT_NAME

    %% Inbound integrations
    [For each inbound integration:]
    INB_NAME["[Caller name]
    ─────────────
    [Protocol] | [Auth]"]:::external
    INB_NAME -->|"[Protocol]
    [Purpose summary]"| SYSTEM

    %% Kafka topics (if applicable -- separate visual lane)
    [For each Kafka topic:]
    TOPIC_NAME[["[topic-name]
    ─────────────
    Kafka"]]:::kafka
    [producer] -->|publish| TOPIC_NAME
    TOPIC_NAME -->|consume| [consumer]
```

---

## Integration Details

### Outbound (this system calls these)

| System | Protocol | Auth | Purpose | DPA | SLA |
|---|---|---|---|---|---|
[For each outbound integration from INTEGRATION_MAP.md -- one row per system]

### Inbound (these systems call this one)

| Caller | Protocol | Auth | Purpose | Notes |
|---|---|---|---|---|
[For each inbound integration]

### Kafka topics (if applicable)

| Topic | Producer | Consumer | Schema | Purpose |
|---|---|---|---|---|
[From KAFKA_TOPICS.md if exists]

---

## Security notes

[Flag any integrations with DPA status Unknown or No]
[Flag any integrations without auth method documented]
[Flag any HTTP (not HTTPS) connections]

---

## Last updated

| Field | Value |
|---|---|
| Generated | [date] |
| Source | .ai/project/INTEGRATION_MAP.md |
| Integration count | [N outbound, N inbound] |
| DPA Unknown | [N -- flag for Security Lead] |
```

## Step 3 -- Publish to Confluence

Create or update a Confluence page:
- Space: [from JIRA_CONFIG.md Confluence space]
- Parent: [from JIRA_CONFIG.md Confluence parent]
- Title: Integration Map -- [System name]

Use HTML storage format (not wiki markup).
Structure the page for a non-technical audience -- architects, PMs, Security Lead.

```html
<h1>Integration Map</h1>
<p><strong>System:</strong> [name] | <strong>Last updated:</strong> [date] | 
<strong>Source:</strong> INTEGRATION_MAP.md in repository</p>

<ac:structured-macro ac:name="info">
  <ac:parameter ac:name="title">About this page</ac:parameter>
  <ac:rich-text-body>
    <p>This page is generated from the codebase. Do not edit manually. 
    Run <code>/generate-integration-diagram</code> in Copilot Chat to update 
    after changing <code>.ai/project/INTEGRATION_MAP.md</code>.</p>
  </ac:rich-text-body>
</ac:structured-macro>

<h2>Overview</h2>
<p>[2-sentence plain language description of what this system connects to and why]</p>

<table>
  <tr>
    <th>Outbound integrations</th>
    <th>Inbound integrations</th>
    <th>Kafka topics</th>
  </tr>
  <tr>
    <td>[N systems this product calls]</td>
    <td>[N systems that call this product]</td>
    <td>[N topics or N/A]</td>
  </tr>
</table>

<h2>Outbound Integrations</h2>
<p>Systems this product calls.</p>

<table>
  <tr>
    <th>System</th><th>Protocol</th><th>Auth</th>
    <th>Purpose</th><th>Data shared</th><th>DPA</th><th>SLA</th>
  </tr>
  [For each outbound integration:]
  <tr>
    <td><strong>[System name]</strong></td>
    <td>[Protocol]</td>
    <td>[Auth method]</td>
    <td>[Plain language purpose]</td>
    <td>[What data is sent -- flag if PII]</td>
    <td>[Yes / <span style="color:red">No</span> / <span style="color:orange">Unknown</span>]</td>
    <td>[SLA or —]</td>
  </tr>
</table>

<h2>Inbound Integrations</h2>
<p>Systems that call this product.</p>

<table>
  <tr>
    <th>Caller</th><th>Protocol</th><th>Auth</th><th>Purpose</th><th>Notes</th>
  </tr>
  [For each inbound integration]
</table>

[If Kafka topics exist:]
<h2>Kafka Topics</h2>
<table>
  <tr><th>Topic</th><th>Producer</th><th>Consumer</th><th>Purpose</th></tr>
  [For each topic]
</table>

<h2>Security and Compliance Notes</h2>
<ul>
  [For each integration with DPA Unknown:]
  <li><strong>⚠ DPA not confirmed:</strong> [system name] -- confirm with Security Lead before sharing personal data</li>
  [For each integration with no auth:]
  <li><strong>⚠ No authentication documented:</strong> [system name] -- verify and document</li>
</ul>

<h2>Diagram</h2>
<p>Technical diagram is in the repository: 
<a href="[GitHub URL]/blob/main/docs/architecture/INTEGRATION_DIAGRAM.md">
docs/architecture/INTEGRATION_DIAGRAM.md</a></p>
<p><em>The Mermaid diagram renders automatically in GitHub.</em></p>
```

If the Confluence page already exists -- update it in place.
Note when it was last updated at the top of the page.

## Step 4 -- Tell the engineer

State:
1. Repo file saved: docs/architecture/INTEGRATION_DIAGRAM.md
2. Confluence page: [URL]
3. Integration count: [N outbound, N inbound, N Kafka topics]
4. Security flags:
   - DPA Unknown: [list systems]
   - Auth not documented: [list systems]
   - Any HTTP (not HTTPS): [list]
5. If any flags: "Run /compliance-gdpr to assess these integrations for GDPR compliance"
6. Git commands:
```
git add docs/architecture/INTEGRATION_DIAGRAM.md
git commit -m "docs: integration diagram updated

[N] outbound, [N] inbound integrations
Source: .ai/project/INTEGRATION_MAP.md
Confluence: [URL]"
git push origin [branch]
```
