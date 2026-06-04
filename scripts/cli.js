#!/usr/bin/env node
// cli.js -- aec (AI Engineering Common) CLI
// @telia-company/ai-engineering-common
// Commands: init | update | list | check | version
//
// Tool config generation behaviour:
//
//   copilot-instructions.md:
//     - Identity + constraints (AGENT.md, HITL_PROTOCOL.md, PRIVACY_GUARDRAILS.md)
//     - Project context from .ai/project/ (grows as brownfield scan populates files)
//     - NO agent skill files (redundant -- .prompt.md files contain own instructions)
//     - NO standards (referenced by prompt files when needed, not every conversation)
//     - Safe to regenerate with npx aec update -- lean by design
//
//   CLAUDE.md:
//     - Full agent skill files + all standards + project context
//     - For Claude Code / Cursor users only
//     - Skipped in GitHub Copilot environments (auto-detected or via aec.config.json)
//
//   .cursorrules:
//     - For Cursor IDE only
//     - Skipped in GitHub Copilot environments
//
//   Environment detection (in priority order):
//     1. aec.config.json aiTool field: "copilot" | "claude" | "all"
//     2. .vscode/ directory exists -> copilot
//     3. .github/copilot-instructions.md already exists -> copilot
//     4. Default -> all (backwards compatible)

'use strict';

const fs   = require('fs');
const path = require('path');
const cmd  = process.argv[2];
const args = process.argv.slice(3);
const PKG  = require('../package.json');

const CWD     = process.cwd();
const AI_DIR  = path.join(CWD, '.ai');
const PROJECT = path.join(AI_DIR, 'project');
const PKG_DIR = path.join(__dirname, '..');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function stripBom(str) {
  return str ? str.replace(/^\uFEFF/, '') : str;
}

function readFile(fp) {
  if (!fs.existsSync(fp)) return null;
  return stripBom(fs.readFileSync(fp, 'utf8'));
}

function writeFile(fp, content) {
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, Buffer.from((content || '').replace(/^\uFEFF/g, ''), 'utf8'));
}

function readCommons(rel) { return readFile(path.join(PKG_DIR, rel)); }
function readProject(rel) { return readFile(path.join(PROJECT, rel)); }

function join(...parts) {
  return parts.filter(Boolean).join('\n\n---\n\n');
}

function log(msg)    { process.stdout.write('  ' + msg + '\n'); }
function header(msg) { process.stdout.write('\n  ' + msg + '\n  ' + '-'.repeat(msg.length) + '\n'); }

// ---------------------------------------------------------------------------
// Environment detection
// ---------------------------------------------------------------------------

function aiToolTarget() {
  // 1. Explicit config wins
  const configPath = path.join(CWD, 'aec.config.json');
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      if (config.aiTool) return config.aiTool;
    } catch (e) { /* malformed -- fall through */ }
  }

  // 2. .vscode directory indicates VS Code + GitHub Copilot
  if (fs.existsSync(path.join(CWD, '.vscode'))) return 'copilot';

  // 3. Existing copilot-instructions.md indicates Copilot environment
  if (fs.existsSync(path.join(CWD, '.github', 'copilot-instructions.md'))) return 'copilot';

  // 4. Default: generate everything (backwards compatible)
  return 'all';
}

// ---------------------------------------------------------------------------
// Agent selection based on project-layer file content
// ---------------------------------------------------------------------------

function getCoreAgents() {
  return [
    'ORCHESTRATOR_AGENT.md',
    'SPEC_WRITER_AGENT.md',
    'STORY_DRAFTER_AGENT.md',
    'CODE_GEN_AGENT.md',
    'PEER_REVIEW_AGENT.md',
    'SECURITY_REVIEW_AGENT.md',
    'BUG_TRIAGE_AGENT.md',
    'FEATURE_VALIDATION_AGENT.md',
  ];
}

function getConditionalAgents() {
  const agents    = [];
  const registry  = readProject('MODULE_REGISTRY.md')   || '';
  const kafka     = readProject('KAFKA_TOPICS.md')       || '';
  const dataModel = readProject('DATA_MODEL.md')         || '';
  const techDebt  = readProject('TECH_DEBT_REGISTRY.md') || '';
  const sre       = readProject('SRE_SERVICE_CONFIG.md') || '';
  const integMap  = readProject('INTEGRATION_MAP.md')    || '';

  const hasKafka       = kafka.length > 100 && !kafka.includes('Not applicable') && kafka.includes('topic');
  const hasDatabase    = dataModel.length > 100 && dataModel.includes('table');
  const hasLegacy      = registry.includes('Legacy') || techDebt.includes('High');
  const hasIntegration = integMap.length > 100;
  const hasSre         = sre.length > 100;

  if (hasKafka)       agents.push('KAFKA_SKILL_AGENT.md', 'EVENT_SCHEMA_AGENT.md');
  if (hasDatabase)    agents.push('DATA_MIGRATION_AGENT.md');
  if (hasLegacy)      agents.push('LEGACY_EXPLAINER_AGENT.md', 'REFACTOR_AGENT.md');
  if (hasIntegration) agents.push('DEPENDENCY_MAPPER_AGENT.md');
  if (hasSre)         agents.push('SRE_AGENT.md', 'INCIDENT_RESPONSE_AGENT.md', 'PROBLEM_MGMT_AGENT.md');

  return [...new Set(agents)];
}

function readAgentFiles(agentList) {
  const agentDir = path.join(PKG_DIR, 'agents');
  if (!fs.existsSync(agentDir)) return [];
  return agentList
    .map(f => readFile(path.join(agentDir, f)))
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// Generate .github/copilot-instructions.md
//
// LEAN by design -- identity + project context only.
// Agent skill files and standards are intentionally excluded:
//   - Each /command is a .prompt.md with its own complete instructions
//   - Including skill files causes describe-not-execute behaviour
//   - Standards waste context on non-code-gen conversations
// Project context IS included and grows as brownfield scan runs.
// npx aec update is safe to run -- it only refreshes project context.
// ---------------------------------------------------------------------------

function isPopulated(content) {
  // Returns true only if the file contains real content, not a stub template.
  // Unpopulated stubs add noise without value -- skip them.
  if (!content) return false;
  const stubs = ['[placeholder]', '[module-name]', '[team-name]', '{{INSTALL_DATE}}',
                 '[Not yet created]', '# TODO', '[module name from'];
  if (stubs.some(s => content.includes(s))) return false;
  return content.split('\n').length >= 20;
}

function generateCopilot() {
  const outPath = path.join(CWD, '.github', 'copilot-instructions.md');

  // Use LEAN SUMMARY versions of foundation files -- not the full documents.
  // HITL_PROTOCOL.md is 393 lines. PRIVACY_GUARDRAILS.md is 321 lines.
  // Copilot does not need the full audit schemas, JSON log formats, or
  // GDPR regulatory references. It needs: which gates exist, when to stop,
  // what not to include in prompts. The summary files cover all of that in ~50 lines.
  //
  // Full versions are still used in CLAUDE.md for Claude Code / Cursor
  // where the full governance detail is genuinely needed.
  const foundationSections = [
    readCommons('foundation/AGENT.md'),                      // 44 lines -- already lean
    readCommons('foundation/HITL_PROTOCOL_SUMMARY.md'),      // ~30 lines -- gate IDs + format only
    readCommons('foundation/PRIVACY_GUARDRAILS_SUMMARY.md'), // ~25 lines -- prohibitions only
  ];

  // JIRA_CONFIG.md is 80+ lines of documentation for the engineer.
  // Copilot only needs the key values: project key, team field, Confluence space.
  // Extract just those values and generate a compact summary instead of
  // including the full file with all the explanatory comments and tables.
  function buildJiraConfigSummary() {
    const raw = readProject('JIRA_CONFIG.md');
    if (!raw) return '# JIRA_CONFIG\nNot configured -- fill in .ai/project/JIRA_CONFIG.md';

    // Extract key values with simple regex -- fail gracefully if not found
    const projectKey   = (raw.match(/Project key:\s*(\S+)/)   || [])[1] || '[not set]';
    const baseUrl      = (raw.match(/Jira base URL:\s*(\S+)/) || [])[1] || '[not set]';
    const boardType    = (raw.match(/Board type:\s*(\S+)/)    || [])[1] || 'Scrum';
    const teamFieldId  = (raw.match(/Field ID:\s*(\S+)/)      || [])[1] || '[not set]';
    const teamValue    = (raw.match(/^\s+(?:Value for demos|Value):\s*(.+)/m) || [])[1]?.trim() || '[not set]';

    // Extract real project key (read-only) if present
    const realProject  = (raw.match(/Real Jira project:\s*(\S+)/) || [])[1] || null;
    const realSpace    = (raw.match(/(?:Real )?Confluence space:\s*(\S+)/) || [])[1] || null;

    let summary = `# JIRA_CONFIG (summary)\n`;
    summary += `Jira write target:      ${projectKey} at ${baseUrl}\n`;
    summary += `Board type:             ${boardType}\n`;
    summary += `Team field:             ${teamFieldId} = "${teamValue}"\n`;
    summary += `Default labels:         ai-engineering-commons\n`;
    summary += `Confluence space:       ${realSpace || '[not set -- fill in JIRA_CONFIG.md]'}\n`;
    summary += `Confluence parent:      [read from JIRA_CONFIG.md]\n`;
    summary += `\nALWAYS read .ai/project/JIRA_CONFIG.md before any Jira or Confluence operation.\n`;
    summary += `Write to the configured project and space above.`;
    return summary;
  }

  // Compact summary builders for large files.
  // Full files stay on disk for commands that need them.
  // copilot-instructions.md gets summaries -- shape of codebase, not every line.

  function buildModuleRegistrySummary() {
    const raw = readProject('MODULE_REGISTRY.md');
    if (!isPopulated(raw)) return null;
    const lines = raw.split('
');
    const tableRows = lines.filter(l =>
      l.includes('|') && (l.includes('Active') || l.includes('Legacy') || l.includes('Deprecated'))
    );
    if (!tableRows.length) return raw;
    const active     = tableRows.filter(l => l.includes('Active')).length;
    const legacy     = tableRows.filter(l => l.includes('Legacy')).length;
    const deprecated = tableRows.filter(l => l.includes('Deprecated')).length;
    let summary = `# MODULE_REGISTRY (summary -- ${tableRows.length} modules)
`;
    summary += `Active: ${active}  Legacy: ${legacy}  Deprecated: ${deprecated}

`;
    summary += `| Module | Status | Risk |
|---|---|---|
`;
    tableRows.forEach(row => {
      const cols = row.split('|').map(c => c.trim()).filter(Boolean);
      if (cols.length >= 3) summary += `| ${cols[0]} | ${cols[2]} | ${cols[4] || '-'} |
`;
    });
    summary += `
Full detail: .ai/project/MODULE_REGISTRY.md`;
    return summary;
  }

  function buildTechDebtSummary() {
    const raw = readProject('TECH_DEBT_REGISTRY.md');
    if (!isPopulated(raw)) return null;
    const lines = raw.split('
');
    const tdRows = lines.filter(l => /\|\s*TD-/.test(l));
    const critical = tdRows.filter(l => l.includes('Critical')).length;
    const high     = tdRows.filter(l => l.includes('High')).length;
    const medium   = tdRows.filter(l => l.includes('Medium')).length;
    const low      = tdRows.filter(l => l.includes('Low') && !l.includes('Below')).length;
    let summary = `# TECH_DEBT_REGISTRY (summary -- ${tdRows.length} items)
`;
    summary += `Critical: ${critical}  High: ${high}  Medium: ${medium}  Low: ${low}

`;
    const important = tdRows.filter(l => l.includes('Critical') || l.includes('High'));
    if (important.length) {
      summary += `Critical and High items:
`;
      important.forEach(row => {
        const cols = row.split('|').map(c => c.trim()).filter(Boolean);
        if (cols.length >= 2) summary += `  ${cols[0]}: ${cols[1]}
`;
      });
    }
    summary += `
Full detail: .ai/project/TECH_DEBT_REGISTRY.md`;
    return summary;
  }

  const projectSections = [
    buildJiraConfigSummary(),
    isPopulated(readProject('ARCHITECTURE_OVERVIEW.md')) ? readProject('ARCHITECTURE_OVERVIEW.md') : null,
    buildModuleRegistrySummary(),
    buildTechDebtSummary(),
    isPopulated(readProject('INTEGRATION_MAP.md'))       ? readProject('INTEGRATION_MAP.md')       : null,
    isPopulated(readProject('DATA_MODEL.md'))            ? readProject('DATA_MODEL.md')            : null,
  ];

  const sections = [...foundationSections, ...projectSections].filter(Boolean);
  writeFile(outPath, sections.join('\n\n---\n\n'));

  const lineCount = sections.join('\n\n---\n\n').split('\n').length;
  const populated = projectSections.filter(Boolean).length;

  log('updated  .github/copilot-instructions.md (' +
    sections.length + ' sections, ' + lineCount + ' lines, ' +
    populated + ' project files populated)');

  if (lineCount > 400) {
    log('NOTE: copilot-instructions.md is ' + lineCount + ' lines.');
    log('      Large project context files after brownfield scan -- expected.');
    log('      Trim verbose sections in .ai/project/ files if context issues occur.');
  }
}

// ---------------------------------------------------------------------------
// Generate CLAUDE.md
// Full agent skill files + all standards. Claude Code / Cursor only.
// Skipped for GitHub Copilot environments.
// ---------------------------------------------------------------------------

function generateClaude() {
  const target = aiToolTarget();

  if (target === 'copilot') {
    log('skipped  CLAUDE.md (GitHub Copilot environment -- not needed)');
    return;
  }

  const outPath       = path.join(CWD, 'CLAUDE.md');
  const coreAgents    = getCoreAgents();
  const condAgents    = getConditionalAgents();
  const extendedAgents = [
    'ESTIMATION_AGENT.md', 'PLANNING_AGENT.md', 'AC_EXECUTOR_AGENT.md',
    'TEST_GEN_AGENT.md', 'ACCESSIBILITY_AGENT.md', 'PERFORMANCE_AGENT.md',
    'DOCUMENTATION_AGENT.md', 'ARCH_DOC_AGENT.md', 'ONBOARDING_AGENT.md',
    'RELEASE_AGENT.md', 'PIPELINE_AGENT.md',
  ];

  const allAgents   = [...new Set([...coreAgents, ...condAgents, ...extendedAgents])];
  const agentBlocks = readAgentFiles(allAgents);

  const sections = [
    readCommons('foundation/AGENT.md'),
    readCommons('foundation/HITL_PROTOCOL.md'),
    readCommons('foundation/CODING_STANDARDS.md'),
    readCommons('foundation/COPILOT_COMMANDS.md'),
    readProject('ARCHITECTURE_OVERVIEW.md'),
    readProject('MODULE_REGISTRY.md'),
    readProject('INTEGRATION_MAP.md'),
    readProject('DATA_MODEL.md'),
    readProject('KAFKA_TOPICS.md'),
    readProject('TECH_DEBT_REGISTRY.md'),
    readCommons('foundation/SECURITY_STANDARDS.md'),
    readCommons('foundation/PERFORMANCE_GUIDELINES.md'),
    readCommons('foundation/ACCESSIBILITY_STANDARDS.md'),
    readCommons('foundation/API_DESIGN_STANDARDS.md'),
    readCommons('foundation/PRIVACY_GUARDRAILS.md'),
    readCommons('foundation/DESIGN_SYSTEM.md'),
    readCommons('sdlc/engineering/BACKEND_PATTERNS.md'),
    readCommons('sdlc/engineering/FRONTEND_PATTERNS.md'),
    readCommons('sdlc/spec/TECHNICAL_SPEC_TEMPLATE.md'),
    readCommons('sdlc/qa/TEST_STRATEGY.md'),
    ...agentBlocks,
  ].filter(Boolean);

  writeFile(outPath, sections.join('\n\n---\n\n'));
  log('updated  CLAUDE.md (' +
    sections.length + ' sections, ' +
    agentBlocks.length + ' agent skill files)');
}

// ---------------------------------------------------------------------------
// Generate .cursorrules
// Cursor IDE only. Skipped for GitHub Copilot environments.
// ---------------------------------------------------------------------------

function generateCursor() {
  const target = aiToolTarget();

  if (target === 'copilot') {
    log('skipped  .cursorrules (GitHub Copilot environment -- not needed)');
    return;
  }

  const outPath = path.join(CWD, '.cursorrules');
  const content = join(
    readCommons('foundation/CODING_STANDARDS.md'),
    readCommons('foundation/COPILOT_COMMANDS.md'),
    readProject('ARCHITECTURE_OVERVIEW.md'),
    readProject('MODULE_REGISTRY.md')
  );
  writeFile(outPath, content || '');
  log('updated  .cursorrules');
}

// ---------------------------------------------------------------------------
// Write COMMONS_VERSION.md
// ---------------------------------------------------------------------------

function writeVersion() {
  fs.mkdirSync(PROJECT, { recursive: true });
  writeFile(
    path.join(PROJECT, 'COMMONS_VERSION.md'),
    '# Commons version\n' +
    'Package: @telia-company/ai-engineering-common\n' +
    'Version: ' + PKG.version + '\n' +
    'Updated: ' + new Date().toISOString().split('T')[0] + '\n'
  );
}

// ---------------------------------------------------------------------------
// aec init
// ---------------------------------------------------------------------------

if (cmd === 'init') {
  header('aec v' + PKG.version + ' -- initialising project');

  fs.mkdirSync(PROJECT, { recursive: true });

  const tmplDir = path.join(PKG_DIR, 'templates', 'project-layer');
  if (fs.existsSync(tmplDir)) {
    const files   = fs.readdirSync(tmplDir).filter(f => f.endsWith('.md'));
    let   created = 0;
    for (const f of files) {
      const dest = path.join(PROJECT, f);
      if (!fs.existsSync(dest)) {
        writeFile(dest, readFile(path.join(tmplDir, f)) || '');
        log('created  .ai/project/' + f);
        created++;
      } else {
        log('exists   .ai/project/' + f + '  (skipped)');
      }
    }
    if (created === 0) log('All project-layer files exist. Run: npx aec update');
  }

  // Copy prompt files to .github/prompts/
  const promptSrc = path.join(PKG_DIR, 'prompts');
  if (fs.existsSync(promptSrc)) {
    const promptDest = path.join(CWD, '.github', 'prompts');
    fs.mkdirSync(promptDest, { recursive: true });
    const prompts = fs.readdirSync(promptSrc).filter(f => f.endsWith('.prompt.md'));
    let copied = 0;
    for (const f of prompts) {
      const dest = path.join(promptDest, f);
      if (!fs.existsSync(dest)) {
        writeFile(dest, readFile(path.join(promptSrc, f)) || '');
        log('created  .github/prompts/' + f);
        copied++;
      } else {
        log('exists   .github/prompts/' + f + '  (skipped)');
      }
    }
    if (copied > 0) log('');
  }

  writeVersion();

  header('Generating tool configs');
  generateCopilot();
  generateClaude();   // skipped automatically for copilot environment
  generateCursor();   // skipped automatically for copilot environment

  const target = aiToolTarget();
  process.stdout.write('\n  Done.\n\n');
  if (target === 'copilot') {
    process.stdout.write('  Environment detected: GitHub Copilot\n');
    process.stdout.write('  CLAUDE.md and .cursorrules were not generated.\n');
    process.stdout.write('  Tip: add aec.config.json with { "aiTool": "copilot" } to make this explicit.\n\n');
  }
  process.stdout.write('  Next steps:\n');
  process.stdout.write('    1. Fill in .ai/project/JIRA_CONFIG.md\n');
  process.stdout.write('    2. Open Copilot Chat Agent mode and run: /run-brownfield-scan\n');
  process.stdout.write('    3. After scan completes: npx aec update\n\n');
}

// ---------------------------------------------------------------------------
// aec update
// ---------------------------------------------------------------------------

else if (cmd === 'update') {
  header('aec -- regenerating tool configs and prompts');

  // Sync prompt files from the commons package.
  //
  // Strategy: track what the commons originally delivered using a
  // checksum sidecar file (.github/prompts/.aec-checksums.json).
  // On each update:
  //   NEW file in commons not in repo            -> copy it   (added)
  //   File changed in commons:
  //     local == previous commons checksum       -> update it (not customised)
  //     local != previous commons checksum       -> skip it   (customised -- keep)
  //
  // Bug fixes in the commons reach all teams automatically.
  // Local customisations are always preserved.
  // Use: npx aec update --force-prompts to override all files.

  const crypto     = require('crypto');
  const promptSrc  = path.join(PKG_DIR, 'prompts');
  const promptDest = path.join(CWD, '.github', 'prompts');
  const checksumFile = path.join(promptDest, '.aec-checksums.json');

  function md5(str) {
    return require('crypto').createHash('md5').update(str || '').digest('hex');
  }

  if (fs.existsSync(promptSrc)) {
    fs.mkdirSync(promptDest, { recursive: true });

    let checksums = {};
    if (fs.existsSync(checksumFile)) {
      try { checksums = JSON.parse(fs.readFileSync(checksumFile, 'utf-8')); }
      catch (e) { checksums = {}; }
    }

    const prompts = fs.readdirSync(promptSrc).filter(f => f.endsWith('.prompt.md'));
    let added = 0, updated = 0, skipped = 0, customised = 0;

    for (const f of prompts) {
      const src         = path.join(promptSrc, f);
      const dest        = path.join(promptDest, f);
      const commons     = readFile(src) || '';
      const commonsHash = md5(commons);

      if (!fs.existsSync(dest)) {
        // New file -- always copy
        writeFile(dest, commons);
        checksums[f] = commonsHash;
        log('added    .github/prompts/' + f);
        added++;
      } else {
        const local     = readFile(dest) || '';
        const localHash = md5(local);

        if (localHash === commonsHash) {
          // Already up to date
          skipped++;
        } else if (checksums[f] && localHash === checksums[f]) {
          // Local matches the PREVIOUS commons version -- not customised, safe to update
          writeFile(dest, commons);
          checksums[f] = commonsHash;
          log('updated  .github/prompts/' + f + '  (commons fix applied)');
          updated++;
        } else if (!checksums[f]) {
          // No checksum record -- predates tracking. Conservative: keep local.
          checksums[f] = commonsHash;
          log('skipped  .github/prompts/' + f + '  (no baseline -- use --force-prompts to override)');
          customised++;
        } else {
          // Local has been customised -- do not overwrite
          log('kept     .github/prompts/' + f + '  (locally customised)');
          customised++;
        }
      }
    }

    writeFile(checksumFile, JSON.stringify(checksums, null, 2));

    const parts = [];
    if (added     > 0) parts.push(added     + ' added');
    if (updated   > 0) parts.push(updated   + ' updated');
    if (skipped   > 0) parts.push(skipped   + ' already current');
    if (customised > 0) parts.push(customised + ' customised (kept)');
    log('prompts  ' + (parts.length ? parts.join(', ') : 'no changes'));
    log('');

    // --force-prompts: overwrite ALL prompt files regardless of customisations
    if (args.includes('--force-prompts')) {
      let forced = 0;
      const forceChecksums = {};
      for (const f of prompts) {
        const commons = readFile(path.join(promptSrc, f)) || '';
        writeFile(path.join(promptDest, f), commons);
        forceChecksums[f] = md5(commons);
        forced++;
      }
      writeFile(checksumFile, JSON.stringify(forceChecksums, null, 2));
      log('FORCE    overwrote all ' + forced + ' prompt files from commons');
      log('');
    }
  }

  writeVersion();
  generateCopilot();  // always regenerated -- lean, safe, picks up latest .ai/project/ content
  generateClaude();   // skipped for copilot environments
  generateCursor();   // skipped for copilot environments

  const target = aiToolTarget();
  process.stdout.write('\n  Done. Commit the updated files:\n');
  process.stdout.write('    .github/prompts/\n');
  process.stdout.write('    .github/copilot-instructions.md\n');
  if (target !== 'copilot') {
    process.stdout.write('    CLAUDE.md\n');
    process.stdout.write('    .cursorrules\n');
  }
  process.stdout.write('\n');
}

// ---------------------------------------------------------------------------
// aec list
// ---------------------------------------------------------------------------

else if (cmd === 'list') {
  const scope = args[0] || 'all';
  header('aec -- commons file listing');

  function listDir(dirPath, label) {
    if (!fs.existsSync(dirPath)) return;
    const files = fs.readdirSync(dirPath)
      .filter(f => f.endsWith('.md') && f !== '.gitkeep')
      .sort();
    if (!files.length) return;
    process.stdout.write('\n  ' + label + ' (' + files.length + ')\n');
    files.forEach(f => process.stdout.write('    ' + f + '\n'));
  }

  if (scope === 'all' || scope === 'commands') {
    process.stdout.write('\n  Commands (type these in Copilot Agent mode)\n');
    const cmdFile = readCommons('foundation/COPILOT_COMMANDS.md') || '';
    const commands = cmdFile.match(/^#### ([A-Z_]+)/gm) || [];
    commands.forEach(c => process.stdout.write('    ' + c.replace('#### ', '') + '\n'));
  }
  if (scope === 'all' || scope === 'agents')      listDir(path.join(PKG_DIR, 'agents'),      'Agent skill files');
  if (scope === 'all' || scope === 'foundation')  listDir(path.join(PKG_DIR, 'foundation'),  'Foundation files');
  if (scope === 'all' || scope === 'playbooks')   listDir(path.join(PKG_DIR, 'playbooks'),   'Playbooks');
  if (scope === 'all' || scope === 'sdlc') {
    ['planning','spec','engineering','qa','release','ops'].forEach(s =>
      listDir(path.join(PKG_DIR, 'sdlc', s), 'SDLC / ' + s));
  }

  process.stdout.write('\n  Usage: npx aec list [commands|agents|foundation|playbooks|sdlc]\n\n');
}

// ---------------------------------------------------------------------------
// aec check
// ---------------------------------------------------------------------------

else if (cmd === 'check') {
  header('aec -- project-layer file validation');

  const required = [
    'ARCHITECTURE_OVERVIEW.md',
    'MODULE_REGISTRY.md',
    'INTEGRATION_MAP.md',
    'DATA_MODEL.md',
    'TECH_DEBT_REGISTRY.md',
    'FEATURE_ENV_CONFIG.md',
    'SRE_SERVICE_CONFIG.md',
  ];

  const placeholders = [
    '[placeholder]', '[module-name]', '[team-name]', '# TODO',
    '{{INSTALL_DATE}}', '[Not yet created]',
  ];

  let issues = 0;
  process.stdout.write('\n');

  for (const file of required) {
    const fp = path.join(PROJECT, file);
    if (!fs.existsSync(fp)) {
      process.stdout.write('  MISSING  ' + file + '\n');
      issues++;
      continue;
    }
    const content   = readFile(fp) || '';
    const found     = placeholders.filter(p => content.includes(p));
    const lineCount = content.split('\n').length;

    if (lineCount < 10)        { process.stdout.write('  EMPTY    ' + file + '\n'); issues++; }
    else if (found.length > 0) { process.stdout.write('  STUB     ' + file + '  (' + found[0] + ')\n'); issues++; }
    else                        { process.stdout.write('  OK       ' + file + '\n'); }
  }

  process.stdout.write('\n');
  if (issues > 0) {
    process.stdout.write('  ' + issues + ' file(s) need attention. Fill them in then run: npx aec update\n\n');
  } else {
    process.stdout.write('  All project-layer files look complete.\n');
    process.stdout.write('  Run: npx aec update to regenerate tool configs.\n\n');
  }
}

// ---------------------------------------------------------------------------
// aec version
// ---------------------------------------------------------------------------

else if (cmd === 'version' || cmd === '-v' || cmd === '--version') {
  process.stdout.write('  @telia-company/ai-engineering-common v' + PKG.version + '\n\n');
}

// ---------------------------------------------------------------------------
// Help
// ---------------------------------------------------------------------------

else {
  process.stdout.write('\n');
  process.stdout.write('  aec v' + PKG.version + ' -- AI Engineering Common CLI\n\n');
  process.stdout.write('  Commands:\n');
  process.stdout.write('    aec init              Bootstrap .ai/ folder and prompt files\n');
  process.stdout.write('    aec update            Regenerate tool configs, sync changed prompt files\n');
  process.stdout.write('    aec update --force-prompts  Overwrite ALL prompt files from commons (ignores customisations)\n');
  process.stdout.write('    aec list [scope]      List files (commands|agents|foundation|playbooks|sdlc)\n');
  process.stdout.write('    aec check             Validate .ai/project/ files are filled in\n');
  process.stdout.write('    aec version           Show installed version\n\n');
  process.stdout.write('  Environment detection (in priority order):\n');
  process.stdout.write('    1. aec.config.json { "aiTool": "copilot|claude|all" }\n');
  process.stdout.write('    2. .vscode/ directory present -> copilot\n');
  process.stdout.write('    3. .github/copilot-instructions.md exists -> copilot\n');
  process.stdout.write('    4. default -> all\n\n');
  process.stdout.write('  Add aec.config.json to your repo to be explicit:\n');
  process.stdout.write('    { "aiTool": "copilot" }  for GitHub Copilot teams\n\n');
}
