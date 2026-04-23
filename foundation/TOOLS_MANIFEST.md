# TOOLS_MANIFEST.md

# AI Engineering Commons -- Tools Manifest

# Version: 1.0.0

# Status: Active

# Last updated: 2025-01

# Owner: CoE Core + DevOps

---

## 1. Purpose

This file is the authoritative list of every tool that agents in the
ai-engineering-commons system are permitted to use. AGENT.md section 4.5
states that agents may only use tools explicitly listed here. Any tool
not in this manifest is forbidden regardless of availability.

Each agent skill file declares a subset of tools from this manifest as
its permitted tool set. An agent may not use a tool that is in this
manifest but not declared in its own skill file.

This file defines:

- What each tool does
- What authentication is required
- What operations are permitted
- What operations are explicitly forbidden
- Rate limits and quotas
- Which agents may use each tool

When a new tool is needed, a CoE PR must add it here before any agent
skill file references it.

---

## 2. Tool categories

Tools are grouped into five categories:


| Category | Description                                       |
| -------- | ------------------------------------------------- |
| T-JIRA   | Jira issue management                             |
| T-CONF   | Confluence documentation                          |
| T-GIT    | GitHub source control                             |
| T-OBS    | Observability (Grafana, Prometheus, Loki)         |
| T-INFRA  | Infrastructure (Azure, Kubernetes)                |
| T-MSG    | Messaging (Kafka, Azure Service Bus)              |
| T-AI     | AI model providers                                |
| T-UTIL   | Utility tools (file system, HTTP, code execution) |


---

## 3. Jira tools (T-JIRA)

### T-JIRA-01 -- Read Jira ticket


| Attribute        | Value                           |
| ---------------- | ------------------------------- |
| Tool ID          | T-JIRA-01                       |
| Operation        | Read a single Jira issue by key |
| Auth             | Jira API token (read scope)     |
| Rate limit       | 100 requests per minute         |
| Permitted agents | All agents                      |


**Permitted operations:**

- Read issue fields (summary, description, status, assignee, labels, ACs)
- Read issue comments
- Read issue attachments metadata (not download)
- Read issue links and dependencies

**Forbidden operations:**

- Download attachments
- Read issues outside the project scope defined in JIRA_INTEGRATION.md

---

### T-JIRA-02 -- Search Jira issues


| Attribute        | Value                                                                                                                        |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Tool ID          | T-JIRA-02                                                                                                                    |
| Operation        | JQL search across issues                                                                                                     |
| Auth             | Jira API token (read scope)                                                                                                  |
| Rate limit       | 30 requests per minute                                                                                                       |
| Permitted agents | Orchestrator, Planning, Story Drafter, Bug Triage, Estimation, Dependency Mapper, Problem Management, Cross-team Coordinator |


**Permitted operations:**

- Execute JQL queries
- Return up to 100 results per query
- Search within permitted project scope only

**Forbidden operations:**

- Queries that return personal data not needed for the task
- Queries across projects outside the team's scope without explicit approval

---

### T-JIRA-03 -- Create Jira issue


| Attribute        | Value                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------ |
| Tool ID          | T-JIRA-03                                                                                              |
| Operation        | Create a new Jira issue                                                                                |
| Auth             | Jira API token (write scope)                                                                           |
| Rate limit       | 20 requests per minute                                                                                 |
| Permitted agents | Story Drafter, Bug Triage, Planning, Vuln Scan, CVE Triage, Problem Management, Incident Response, SRE |


**Permitted operations:**

- Create Story, Bug, Task, Problem, Incident issue types
- Set summary, description, priority, labels, assignee, components
- Link to parent epic
- Set custom fields defined in JIRA_INTEGRATION.md

**Forbidden operations:**

- Create Sub-task issues (use Story with parent link instead)
- Create issues in projects not in the team's permitted project list
- Set fields that require admin permissions

---

### T-JIRA-04 -- Update Jira issue


| Attribute        | Value                                                                                                                                    |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Tool ID          | T-JIRA-04                                                                                                                                |
| Operation        | Update fields on an existing Jira issue                                                                                                  |
| Auth             | Jira API token (write scope)                                                                                                             |
| Rate limit       | 20 requests per minute                                                                                                                   |
| Permitted agents | Story Drafter, Bug Triage, Planning, Spec Writer, Code Gen, Peer Review, Release, Problem Management, Incident Response, SRE, CVE Triage |


**Permitted operations:**

- Update status (via transition, not direct field set)
- Update summary, description, priority, labels, assignee
- Add and remove issue links
- Update acceptance criteria field
- Update custom fields defined in JIRA_INTEGRATION.md

**Forbidden operations:**

- Delete issues
- Change issue type
- Modify reporter field
- Update issues outside the team's project scope

---

### T-JIRA-05 -- Add Jira comment


| Attribute        | Value                                   |
| ---------------- | --------------------------------------- |
| Tool ID          | T-JIRA-05                               |
| Operation        | Add a comment to an existing Jira issue |
| Auth             | Jira API token (write scope)            |
| Rate limit       | 30 requests per minute                  |
| Permitted agents | All agents                              |


**Permitted operations:**

- Add formatted text comments
- Add handover packages (see AGENT_HANDOVER.md)
- Add HITL gate outputs (see HITL_PROTOCOL.md)
- Add links to Confluence pages and GitHub PRs

**Forbidden operations:**

- Delete or edit existing comments
- Add comments containing personal data or credentials

---

### T-JIRA-06 -- Transition Jira issue status


| Attribute        | Value                                                                |
| ---------------- | -------------------------------------------------------------------- |
| Tool ID          | T-JIRA-06                                                            |
| Operation        | Move an issue through its workflow                                   |
| Auth             | Jira API token (write scope)                                         |
| Rate limit       | 20 requests per minute                                               |
| Permitted agents | Bug Triage, Planning, Release, Problem Management, Incident Response |


**Permitted operations:**

- Transition to permitted statuses defined in JIRA_INTEGRATION.md
- Add transition comment

**Forbidden operations:**

- Transition to Done without HITL gate approval
- Close P0/P1 incidents without post-mortem link attached

---

## 4. Confluence tools (T-CONF)

### T-CONF-01 -- Read Confluence page


| Attribute        | Value                                 |
| ---------------- | ------------------------------------- |
| Tool ID          | T-CONF-01                             |
| Operation        | Read a Confluence page by ID or title |
| Auth             | Confluence API token (read scope)     |
| Rate limit       | 100 requests per minute               |
| Permitted agents | All agents                            |


**Permitted operations:**

- Read page content (body, title, metadata)
- Read page children list
- Read page labels
- Search within permitted spaces

**Forbidden operations:**

- Read pages in restricted spaces without explicit access grant
- Read pages containing classified information beyond agent data tier

---

### T-CONF-02 -- Create Confluence page


| Attribute        | Value                                                                                           |
| ---------------- | ----------------------------------------------------------------------------------------------- |
| Tool ID          | T-CONF-02                                                                                       |
| Operation        | Create a new Confluence page                                                                    |
| Auth             | Confluence API token (write scope)                                                              |
| Rate limit       | 10 requests per minute                                                                          |
| Permitted agents | Spec Writer, Documentation, Arch Doc, Stakeholder Report, Problem Management, Incident Response |


**Permitted operations:**

- Create page under a permitted parent page
- Set title, body content, labels
- Attach the page to a space permitted in CONFLUENCE_INTEGRATION.md

**Forbidden operations:**

- Create pages in restricted spaces
- Create pages that reproduce copyrighted third-party content verbatim
- Create pages containing personal data not permitted by PRIVACY_GUARDRAILS.md

---

### T-CONF-03 -- Update Confluence page


| Attribute        | Value                                                                                                |
| ---------------- | ---------------------------------------------------------------------------------------------------- |
| Tool ID          | T-CONF-03                                                                                            |
| Operation        | Update the content of an existing Confluence page                                                    |
| Auth             | Confluence API token (write scope)                                                                   |
| Rate limit       | 10 requests per minute                                                                               |
| Permitted agents | Spec Writer, Documentation, Arch Doc, Stakeholder Report, Problem Management, Incident Response, SRE |


**Permitted operations:**

- Update page body content
- Add or update labels
- Increment page version correctly

**Forbidden operations:**

- Delete page content without creating a new version first
- Update pages owned by other teams without approval
- Overwrite pages that contain human-authored content without preserving it

---

### T-CONF-04 -- Search Confluence


| Attribute        | Value                                               |
| ---------------- | --------------------------------------------------- |
| Tool ID          | T-CONF-04                                           |
| Operation        | Full-text search across permitted Confluence spaces |
| Auth             | Confluence API token (read scope)                   |
| Rate limit       | 30 requests per minute                              |
| Permitted agents | All agents                                          |


**Permitted operations:**

- CQL (Confluence Query Language) search
- Return up to 50 results per query
- Filter by space, label, content type, date

**Forbidden operations:**

- Search restricted spaces without access grant
- Use search results to build profiles of individuals

---

## 5. GitHub tools (T-GIT)

### T-GIT-01 -- Read repository content


| Attribute        | Value                                                |
| ---------------- | ---------------------------------------------------- |
| Tool ID          | T-GIT-01                                             |
| Operation        | Read files and directory structure from a repository |
| Auth             | GitHub token (repo read scope)                       |
| Rate limit       | 5000 requests per hour (GitHub API limit)            |
| Permitted agents | All agents                                           |


**Permitted operations:**

- Read file content by path
- List directory contents
- Read commit history
- Read branch list

**Forbidden operations:**

- Read from repositories outside the permitted organisation
- Read files containing secrets (apply PRIVACY_GUARDRAILS.md patterns first)

---

### T-GIT-02 -- Create or update file


| Attribute        | Value                                                                                         |
| ---------------- | --------------------------------------------------------------------------------------------- |
| Tool ID          | T-GIT-02                                                                                      |
| Operation        | Create or update a file in a repository branch                                                |
| Auth             | GitHub token (repo write scope)                                                               |
| Rate limit       | 100 requests per minute                                                                       |
| Permitted agents | Code Gen, Refactor, Data Migration, Pipeline, Greenfield Scaffold, Observability Setup, Infra |


**Permitted operations:**

- Create new files on a feature branch
- Update existing files on a feature branch
- Write to `.ai/` folder and generated config files

**Forbidden operations:**

- Write directly to main or release branches
- Write to branches protected by branch protection rules
- Overwrite files without reading current content first (to avoid conflicts)
- Write secrets, credentials, or personal data to any file

---

### T-GIT-03 -- Create pull request


| Attribute        | Value                                                              |
| ---------------- | ------------------------------------------------------------------ |
| Tool ID          | T-GIT-03                                                           |
| Operation        | Open a pull request from a feature branch to a target branch       |
| Auth             | GitHub token (repo write scope)                                    |
| Rate limit       | 10 requests per minute                                             |
| Permitted agents | Code Gen, Refactor, Data Migration, Pipeline, Peer Review, Release |


**Permitted operations:**

- Create PR with title, description, labels, reviewers
- Link PR to Jira ticket via description or label
- Set draft status

**Forbidden operations:**

- Auto-merge PRs (merging is always a HITL gate D01)
- Request review from individuals not in the team's reviewer list
- Create PRs directly to main without branch protection

---

### T-GIT-04 -- Read pull request


| Attribute        | Value                                                                       |
| ---------------- | --------------------------------------------------------------------------- |
| Tool ID          | T-GIT-04                                                                    |
| Operation        | Read PR details, diff, and review comments                                  |
| Auth             | GitHub token (repo read scope)                                              |
| Rate limit       | 100 requests per minute                                                     |
| Permitted agents | Peer Review, Security Review, Accessibility, Performance, Release, Arch Doc |


**Permitted operations:**

- Read PR title, description, labels, status
- Read PR diff (file changes)
- Read existing review comments
- Read CI/CD check results

**Forbidden operations:**

- Read PRs from repositories outside the permitted scope

---

### T-GIT-05 -- Add pull request review comment


| Attribute        | Value                                                    |
| ---------------- | -------------------------------------------------------- |
| Tool ID          | T-GIT-05                                                 |
| Operation        | Add a review comment to a pull request                   |
| Auth             | GitHub token (repo write scope)                          |
| Rate limit       | 30 requests per minute                                   |
| Permitted agents | Peer Review, Security Review, Accessibility, Performance |


**Permitted operations:**

- Add inline comments on specific lines
- Add general PR review comments
- Submit review with APPROVE, REQUEST_CHANGES, or COMMENT status
- NOTE: Agents submit COMMENT or REQUEST_CHANGES only -- APPROVE requires human

**Forbidden operations:**

- Submit APPROVE review (only humans may approve)
- Dismiss existing human reviews
- Delete review comments

---

### T-GIT-06 -- Read GitHub Actions workflow results


| Attribute        | Value                                    |
| ---------------- | ---------------------------------------- |
| Tool ID          | T-GIT-06                                 |
| Operation        | Read CI/CD pipeline run results and logs |
| Auth             | GitHub token (actions read scope)        |
| Rate limit       | 100 requests per minute                  |
| Permitted agents | Pipeline, SRE, Release, Peer Review      |


**Permitted operations:**

- Read workflow run status and conclusion
- Read step-level results
- Read workflow logs (truncated to last 50KB per step)

**Forbidden operations:**

- Trigger workflow runs (use T-GIT-07)
- Cancel running workflows without approval

---

### T-GIT-07 -- Trigger GitHub Actions workflow


| Attribute        | Value                                      |
| ---------------- | ------------------------------------------ |
| Tool ID          | T-GIT-07                                   |
| Operation        | Trigger a workflow dispatch event          |
| Auth             | GitHub token (actions write scope)         |
| Rate limit       | 10 requests per minute                     |
| Permitted agents | Pipeline, Release, SRE (Tier 1 and 2 only) |


**Permitted operations:**

- Trigger workflow dispatch on permitted workflows
- Pass permitted input parameters

**Forbidden operations:**

- Trigger production deployment workflows without HITL gate A02
- Trigger workflows not in the permitted workflow list in GITHUB_INTEGRATION.md

---

## 6. Observability tools (T-OBS)

### T-OBS-01 -- Query Grafana dashboard


| Attribute        | Value                                                    |
| ---------------- | -------------------------------------------------------- |
| Tool ID          | T-OBS-01                                                 |
| Operation        | Read panel data from a Grafana dashboard                 |
| Auth             | Grafana service account token (viewer role)              |
| Rate limit       | 60 requests per minute                                   |
| Permitted agents | SRE, Performance, Observability Setup, Incident Response |


**Permitted operations:**

- Query panel data within the SRE_DASHBOARD_REGISTRY registered panels
- Read dashboard metadata
- Read alert rule definitions

**Forbidden operations:**

- Modify dashboards or alert rules (use T-OBS-03)
- Query panels outside the SRE_DASHBOARD_REGISTRY
- Read dashboards in restricted organisational units without approval

---

### T-OBS-02 -- Query Prometheus / Loki


| Attribute        | Value                                        |
| ---------------- | -------------------------------------------- |
| Tool ID          | T-OBS-02                                     |
| Operation        | Execute PromQL or LogQL queries              |
| Auth             | Prometheus/Loki service account (read scope) |
| Rate limit       | 30 queries per minute                        |
| Permitted agents | SRE, Performance, Incident Response          |


**Permitted operations:**

- Execute PromQL instant and range queries
- Execute LogQL log queries
- Query within permitted label namespaces

**Forbidden operations:**

- Queries that return personal data in log lines -- apply scrubbing first
- Long-range queries that would cause excessive load (> 30 days range)

---

### T-OBS-03 -- Create Grafana dashboard or alert


| Attribute        | Value                                               |
| ---------------- | --------------------------------------------------- |
| Tool ID          | T-OBS-03                                            |
| Operation        | Create or update Grafana dashboards and alert rules |
| Auth             | Grafana service account token (editor role)         |
| Rate limit       | 10 requests per minute                              |
| Permitted agents | Observability Setup                                 |


**Permitted operations:**

- Create new dashboards in permitted folders
- Update existing dashboards owned by the agent's team
- Create alert rules in permitted namespaces
- Register new dashboards in SRE_DASHBOARD_REGISTRY

**Forbidden operations:**

- Modify dashboards owned by other teams
- Delete alert rules
- Create alerts with notification channels outside the approved list

---

## 7. Infrastructure tools (T-INFRA)

### T-INFRA-01 -- Read Azure resource state


| Attribute        | Value                                        |
| ---------------- | -------------------------------------------- |
| Tool ID          | T-INFRA-01                                   |
| Operation        | Read Azure resource configuration and status |
| Auth             | Azure Managed Identity (reader role)         |
| Rate limit       | Azure API limits apply                       |
| Permitted agents | SRE, Infra, Incident Response                |


**Permitted operations:**

- Read resource group contents
- Read resource configuration (not secrets)
- Read deployment status

**Forbidden operations:**

- Read Key Vault secrets (never -- secrets stay in Key Vault)
- Read resources outside the permitted subscription scope

---

### T-INFRA-02 -- Execute Kubernetes operations


| Attribute        | Value                                                 |
| ---------------- | ----------------------------------------------------- |
| Tool ID          | T-INFRA-02                                            |
| Operation        | Read and write to Kubernetes cluster                  |
| Auth             | Kubernetes service account (RBAC-limited)             |
| Rate limit       | 100 requests per minute                               |
| Permitted agents | SRE (Tier 1 and 2 only within autonomy budget), Infra |


**Permitted read operations:**

- Get pod status, logs, events
- Get deployment, service, configmap definitions
- Get node status

**Permitted write operations (SRE Tier 1 and 2 only):**

- Restart a deployment (kubectl rollout restart)
- Scale a deployment within the bounds defined in SRE_AUTONOMY_BUDGET.md
- Delete a specific failing pod (triggers automatic replacement)

**Forbidden operations:**

- Delete namespaces or cluster-level resources
- Modify RBAC roles or bindings
- Access secrets directly
- Any write operation in production outside SRE_AUTONOMY_BUDGET.md

---

## 8. Messaging tools (T-MSG)

### T-MSG-01 -- Kafka admin operations


| Attribute        | Value                                                |
| ---------------- | ---------------------------------------------------- |
| Tool ID          | T-MSG-01                                             |
| Operation        | Read Kafka cluster metadata and consumer group state |
| Auth             | Kafka service account (read-only ACLs)               |
| Rate limit       | 10 requests per minute                               |
| Permitted agents | Kafka Skill, Event Schema, SRE, Performance          |


**Permitted operations:**

- List topics registered in KAFKA_TOPICS.md
- Read consumer group offsets and lag
- Read topic schema from schema registry
- Check DLQ message count

**Forbidden operations:**

- Read message content from production topics (data may contain PII)
- Delete topics or consumer groups
- Modify topic configuration

---

### T-MSG-02 -- Kafka produce (test environments only)


| Attribute        | Value                                                         |
| ---------------- | ------------------------------------------------------------- |
| Tool ID          | T-MSG-02                                                      |
| Operation        | Produce test events to Kafka topics                           |
| Auth             | Kafka service account (produce ACLs -- test environment only) |
| Rate limit       | 100 messages per minute                                       |
| Permitted agents | Kafka Skill, Feature Validation                               |
| Environment      | Test and staging only -- never production                     |


**Permitted operations:**

- Produce events to topics registered in KAFKA_TOPICS.md
- Use schema-validated payloads only
- Produce to test or staging environments only

**Forbidden operations:**

- Produce to production topics under any circumstance
- Produce events without schema validation
- Produce events containing real personal data

---

### T-MSG-03 -- Kafka consume (test environments only)


| Attribute        | Value                                                         |
| ---------------- | ------------------------------------------------------------- |
| Tool ID          | T-MSG-03                                                      |
| Operation        | Consume events from Kafka topics for test assertion           |
| Auth             | Kafka service account (consume ACLs -- test environment only) |
| Rate limit       | Bounded by consumer group                                     |
| Permitted agents | Kafka Skill, Feature Validation                               |
| Environment      | Test and staging only -- never production                     |


**Permitted operations:**

- Consume from test or staging topics for assertion in automated tests
- Read schema-validated payloads
- Assert on event content against expected test values

**Forbidden operations:**

- Consume from production topics
- Store consumed event content outside the test run context
- Commit offsets without completing assertion

---

## 9. AI model tools (T-AI)

### T-AI-01 -- Language model inference


| Attribute        | Value                                                           |
| ---------------- | --------------------------------------------------------------- |
| Tool ID          | T-AI-01                                                         |
| Operation        | Send prompts to an approved language model                      |
| Auth             | Azure OpenAI API key (from Key Vault) or approved provider auth |
| Rate limit       | Per provider quota -- see COMPLIANCE_STANDARDS.md section 3.2   |
| Permitted agents | All agents                                                      |


**Permitted operations:**

- Send prompts containing Internal or Public tier data
- Send prompts containing Confidential tier data to approved providers only
- Receive and process model responses

**Forbidden operations:**

- Send Restricted tier data to any external provider
- Send content violating PRIVACY_GUARDRAILS.md
- Cache model responses containing personal data
- Use unapproved providers -- see COMPLIANCE_STANDARDS.md section 3.2

---

## 10. Utility tools (T-UTIL)

### T-UTIL-01 -- File system read


| Attribute        | Value                                                  |
| ---------------- | ------------------------------------------------------ |
| Tool ID          | T-UTIL-01                                              |
| Operation        | Read files from the local repository working directory |
| Auth             | Operating system file permissions                      |
| Rate limit       | None                                                   |
| Permitted agents | All agents                                             |


**Permitted operations:**

- Read any file within the repository working directory
- Read the .ai/ project layer files
- Read package manifests (pom.xml, package.json, etc.)

**Forbidden operations:**

- Read files outside the repository directory
- Read OS-level configuration files
- Read other users' home directories

---

### T-UTIL-02 -- File system write


| Attribute        | Value                                                                                                                              |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Tool ID          | T-UTIL-02                                                                                                                          |
| Operation        | Write files to the local repository working directory                                                                              |
| Auth             | Operating system file permissions                                                                                                  |
| Rate limit       | None                                                                                                                               |
| Permitted agents | Code Gen, Refactor, Data Migration, Pipeline, Documentation, Greenfield Scaffold, Brownfield Discovery, Observability Setup, Infra |


**Permitted operations:**

- Write to feature branch working directory only
- Write generated code, configuration, and documentation files
- Write must use UTF-8 encoding without BOM

**Forbidden operations:**

- Write to main or protected branch directly
- Write secrets or credentials to any file
- Overwrite existing files without reading current content first

---

### T-UTIL-03 -- HTTP request (external)


| Attribute        | Value                                                                                   |
| ---------------- | --------------------------------------------------------------------------------------- |
| Tool ID          | T-UTIL-03                                                                               |
| Operation        | Make HTTP requests to external APIs                                                     |
| Auth             | Per target API -- credentials from Key Vault only                                       |
| Rate limit       | Per target API rate limit                                                               |
| Permitted agents | Code Gen (for OpenAPI fetching), Spec Writer, Integration mapper, Vuln Scan, CVE Triage |


**Permitted operations:**

- GET requests to public APIs and approved partner APIs
- POST requests to approved partner APIs with schema-validated payloads
- Requests must use HTTPS only
- Target must be in INTEGRATION_MAP.md or a public package registry

**Forbidden operations:**

- Requests to internal services that bypass the API gateway
- Requests to arbitrary user-supplied URLs (SSRF risk -- see SECURITY_STANDARDS.md)
- Requests carrying personal data to non-approved destinations
- Requests using self-signed certificates in production

---

### T-UTIL-04 -- Code execution (sandboxed)


| Attribute        | Value                                                       |
| ---------------- | ----------------------------------------------------------- |
| Tool ID          | T-UTIL-04                                                   |
| Operation        | Execute code in an isolated sandbox environment             |
| Auth             | Sandbox service account                                     |
| Rate limit       | 10 executions per minute, 60 second timeout per execution   |
| Permitted agents | Feature Validation, Test Gen, Data Migration (dry-run only) |


**Permitted operations:**

- Execute test suites against test environment
- Execute dry-run database migrations against a test database
- Execute schema validation scripts
- Execute linting and static analysis tools

**Forbidden operations:**

- Execute code against production databases or services
- Execute code that makes external network calls outside the sandbox
- Execute code without a timeout
- Execute user-supplied code without inspection

---

## 11. Tool access matrix

The following matrix shows which tool categories each agent may access.
Individual tool IDs within a category are further restricted by the
agent's own skill file.


| Agent               | T-JIRA | T-CONF | T-GIT | T-OBS | T-INFRA | T-MSG | T-AI | T-UTIL |
| ------------------- | ------ | ------ | ----- | ----- | ------- | ----- | ---- | ------ |
| Orchestrator        | R      | R      | R     | --    | --      | --    | Y    | R      |
| Spec Writer         | R/W    | R/W    | R     | --    | --      | --    | Y    | R      |
| Story Drafter       | R/W    | R      | R     | --    | --      | --    | Y    | R      |
| Code Gen            | R/W    | R      | R/W   | --    | --      | --    | Y    | R/W    |
| Refactor            | R/W    | R      | R/W   | --    | --      | --    | Y    | R/W    |
| Test Gen            | R/W    | R      | R/W   | --    | --      | --    | Y    | R/W    |
| Feature Validation  | R/W    | R      | R     | --    | --      | R/W   | Y    | R/W    |
| Kafka Skill         | R      | R      | R     | --    | --      | R/W   | Y    | R      |
| Peer Review         | R/W    | R      | R/W   | --    | --      | --    | Y    | R      |
| Security Review     | R/W    | R      | R/W   | --    | --      | --    | Y    | R      |
| Vuln Scan           | R/W    | R      | R     | --    | --      | --    | Y    | R      |
| SRE                 | R/W    | R/W    | R     | R/W   | R/W     | R     | Y    | R      |
| Incident Response   | R/W    | R/W    | R     | R     | --      | --    | Y    | R      |
| Problem Management  | R/W    | R/W    | R     | --    | --      | --    | Y    | R      |
| Release             | R/W    | R/W    | R/W   | --    | --      | --    | Y    | R      |
| Arch Doc            | R      | R/W    | R     | --    | --      | --    | Y    | R      |
| Documentation       | R      | R/W    | R     | --    | --      | --    | Y    | R      |
| Observability Setup | R      | R/W    | R/W   | R/W   | --      | --    | Y    | R/W    |
| Infra               | R      | R      | R/W   | --    | R/W     | --    | Y    | R/W    |
| Compliance          | R      | R/W    | R     | --    | --      | --    | Y    | R      |


R = read only, R/W = read and write, Y = yes (all sub-tools), -- = no access

---

## 12. Adding a new tool

When a new tool is needed that is not in this manifest:

1. The agent or engineer identifies the need and documents:
  - What the tool does
  - Which agents need it
  - What auth is required
  - What the rate limits are
  - What operations should be permitted and forbidden
2. A CoE PR is raised adding the tool to this file
3. Two CoE approvals are required
4. Security Lead approval required if the tool has write access
  to production systems
5. The tool may not be used until the PR is merged and released
  as a new commons version

---

## 13. Version and review


| Attribute       | Value                                                                        |
| --------------- | ---------------------------------------------------------------------------- |
| File owner      | CoE Core + DevOps                                                            |
| Review cadence  | Quarterly -- or when a new tool integration is added                         |
| Last reviewed   | 2025-01                                                                      |
| Next review due | 2025-04                                                                      |
| Approvers       | CoE Lead, DevOps Lead, Security Lead                                         |
| Change process  | PR to ai-engineering-common, 2 CoE approvals + Security Lead for write tools |


