# ai-engineering-commons

Shared AI engineering agents, skills, and commands for all Telia development
teams. Single source of truth for AI-assisted engineering across the org.

## What is this?

- **40 agent skill files** — specialist AI agents for every SDLC stage
- **28 commands** — standardised prompts for daily engineering tasks
- **95 guide and standards files** — coding standards, QA guides, ops runbooks
- **15 journey flows** — end-to-end maps for every common scenario

## How teams use it

Install via npm (GitHub Packages):

```
npm install @YOUR_ORG/ai-engineering-commons
npx aec init
```

## Structure

```
foundation/      Zero-dependency base files — every agent loads these
agents/          40 specialist agent skill files
commands/        28 standardised command prompts
sdlc/            Stage guides (planning, spec, engineering, QA, release, ops)
security/        Security scanning, SAST config, compliance standards
architecture/    C4 standards, ADR templates, tech radar
coe/             CoE governance, metrics, champion guides
templates/       Project-layer stubs for new projects
scripts/         CLI installer and config generators
```

## Versioning

- **Patch** (x.x.N) — prompt fixes. Auto-merged by Dependabot.
- **Minor** (x.N.0) — new agents or files. Team review recommended.
- **Major** (N.0.0) — breaking changes. Migration guide provided.

## Owner

AI Center of Excellence — Telia Group
