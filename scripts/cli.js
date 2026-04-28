#!/usr/bin/env node
// cli.js -- aec (AI Engineering Common) CLI
// @telia-company/ai-engineering-common
// Commands: init | update | list | check | version
//
// copilot-instructions.md now includes:
//   - AGENT.md (who Copilot is)
//   - HITL_PROTOCOL.md (gate system)
//   - CODING_STANDARDS.md (patterns)
//   - COPILOT_COMMANDS.md (all commands engineers can type)
//   - Project-layer files (architecture, modules, integrations, data model)
//   - Core agent skill files (so WRITE_SPEC etc. execute correctly)
//
// CLAUDE.md includes everything above + more agent skill files
// .cursorrules includes coding standards only

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
// Agent selection based on project-layer file content
// ---------------------------------------------------------------------------

function getCoreAgents() {
  // These 8 agents are always included in copilot-instructions.md
  // They cover the most common daily commands
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
  const agents     = [];
  const registry   = readProject('MODULE_REGISTRY.md')   || '';
  const kafka      = readProject('KAFKA_TOPICS.md')       || '';
  const dataModel  = readProject('DATA_MODEL.md')         || '';
  const techDebt   = readProject('TECH_DEBT_REGISTRY.md') || '';
  const sre        = readProject('SRE_SERVICE_CONFIG.md') || '';
  const integMap   = readProject('INTEGRATION_MAP.md')    || '';

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
// COMPREHENSIVE -- includes commands + core agents + project context
// This is the file that makes "WRITE_SPEC PROJ-42" work in Copilot
// ---------------------------------------------------------------------------

function generateCopilot() {
  const outPath = path.join(CWD, '.github', 'copilot-instructions.md');

  const coreAgents      = getCoreAgents();
  const conditionalAgents = getConditionalAgents();
  const allAgents       = [...new Set([...coreAgents, ...conditionalAgents])];
  const agentBlocks     = readAgentFiles(allAgents);

  const sections = [
    // Identity and constraints
    readCommons('foundation/AGENT.md'),
    readCommons('foundation/HITL_PROTOCOL.md'),
    readCommons('foundation/CODING_STANDARDS.md'),

    // NOTE: COPILOT_COMMANDS.md is intentionally NOT included here.
    // Commands are delivered as .prompt.md files in .github/prompts/.
    // Including the command menu in copilot-instructions.md causes the
    // model to describe commands instead of executing them.

    // Project context -- specific to this codebase
    readProject('ARCHITECTURE_OVERVIEW.md'),
    readProject('MODULE_REGISTRY.md'),
    readProject('INTEGRATION_MAP.md'),
    readProject('DATA_MODEL.md'),

    // Agent skill files -- how each command executes
    ...agentBlocks,

    // Standards referenced by agents
    readCommons('foundation/SECURITY_STANDARDS.md'),
    readCommons('foundation/PERFORMANCE_GUIDELINES.md'),
    readCommons('foundation/ACCESSIBILITY_STANDARDS.md'),
    readCommons('foundation/API_DESIGN_STANDARDS.md'),
    readCommons('foundation/PRIVACY_GUARDRAILS.md'),
  ].filter(Boolean);

  writeFile(outPath, sections.join('\n\n---\n\n'));

  log('updated  .github/copilot-instructions.md (' +
    sections.length + ' sections, ' +
    agentBlocks.length + ' agent skill files, commands included)');
}

// ---------------------------------------------------------------------------
// Generate CLAUDE.md
//
// Everything copilot-instructions.md has, plus more agent skill files
// ---------------------------------------------------------------------------

function generateClaude() {
  const outPath = path.join(CWD, 'CLAUDE.md');

  const coreAgents        = getCoreAgents();
  const conditionalAgents = getConditionalAgents();

  // Claude gets additional agents that are too large for copilot-instructions
  const extendedAgents = [
    'ESTIMATION_AGENT.md',
    'PLANNING_AGENT.md',
    'AC_EXECUTOR_AGENT.md',
    'TEST_GEN_AGENT.md',
    'ACCESSIBILITY_AGENT.md',
    'PERFORMANCE_AGENT.md',
    'DOCUMENTATION_AGENT.md',
    'ARCH_DOC_AGENT.md',
    'ONBOARDING_AGENT.md',
    'RELEASE_AGENT.md',
    'PIPELINE_AGENT.md',
  ];

  const allAgents   = [...new Set([...coreAgents, ...conditionalAgents, ...extendedAgents])];
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
// ---------------------------------------------------------------------------

function generateCursor() {
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

  // Copy native Copilot prompt files to .github/prompts/
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
  generateClaude();
  generateCursor();

  process.stdout.write('\n  Done.\n\n');
  process.stdout.write('  Next steps:\n');
  process.stdout.write('    1. Fill in .ai/project/ARCHITECTURE_OVERVIEW.md\n');
  process.stdout.write('    2. Fill in .ai/project/MODULE_REGISTRY.md\n');
  process.stdout.write('    3. Fill in .ai/project/INTEGRATION_MAP.md\n');
  process.stdout.write('    4. Run: npx aec update\n');
  process.stdout.write('    5. Open Copilot Chat and type: DRAFT_BRIEF\n\n');
}

// ---------------------------------------------------------------------------
// aec update
// ---------------------------------------------------------------------------

else if (cmd === 'update') {
  header('aec -- regenerating tool configs and prompts');

  // Sync any new prompt files from the commons
  const promptSrc  = path.join(PKG_DIR, 'prompts');
  const promptDest = path.join(CWD, '.github', 'prompts');
  if (fs.existsSync(promptSrc)) {
    fs.mkdirSync(promptDest, { recursive: true });
    const prompts = fs.readdirSync(promptSrc).filter(f => f.endsWith('.prompt.md'));
    let added = 0;
    for (const f of prompts) {
      const dest = path.join(promptDest, f);
      if (!fs.existsSync(dest)) {
        writeFile(dest, readFile(path.join(promptSrc, f)) || '');
        log('added    .github/prompts/' + f);
        added++;
      }
    }
    if (added > 0) log('');
  }

  writeVersion();
  generateCopilot();
  generateClaude();
  generateCursor();

  process.stdout.write('\n  Done. Commit the updated files:\n');
  process.stdout.write('    .github/prompts/     (any new prompt files)\n');
  process.stdout.write('    .github/copilot-instructions.md\n');
  process.stdout.write('    CLAUDE.md\n');
  process.stdout.write('    .cursorrules\n\n');
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

    if (lineCount < 10)       { process.stdout.write('  EMPTY    ' + file + '\n'); issues++; }
    else if (found.length > 0){ process.stdout.write('  STUB     ' + file + '  (' + found[0] + ')\n'); issues++; }
    else                       { process.stdout.write('  OK       ' + file + '\n'); }
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
  process.stdout.write('    aec init              Bootstrap .ai/ folder in a new project\n');
  process.stdout.write('    aec update            Regenerate copilot-instructions.md, CLAUDE.md, .cursorrules\n');
  process.stdout.write('    aec list [scope]      List files (commands|agents|foundation|playbooks|sdlc)\n');
  process.stdout.write('    aec check             Validate .ai/project/ files are filled in\n');
  process.stdout.write('    aec version           Show installed version\n\n');
  process.stdout.write('  After init and filling in .ai/project/ files:\n');
  process.stdout.write('    npx aec update\n');
  process.stdout.write('    Then in Copilot Agent mode: DRAFT_BRIEF\n\n');
}

// Note: prompts are not appended here -- the file already handles them
// via the init command's template copying logic below
