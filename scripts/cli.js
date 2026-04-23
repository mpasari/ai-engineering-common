#!/usr/bin/env node
// cli.js -- aec (AI Engineering Common) CLI
// @telia-company/ai-engineering-common
// Commands: init | update | list | check | version
//
// Enhancements over v1:
//   - CLAUDE.md now includes agent skill files relevant to the current project
//   - aec list  -- shows all available agents, commands, and guide files
//   - aec check -- validates .ai/project/ files are filled in (not just stubs)
//   - BOM stripping on all reads
//   - Writes files using Buffer.from(..., 'utf8') -- no BOM on output
//   - Cleaner console output with section headers

'use strict';

const fs      = require('fs');
const path    = require('path');
const cmd     = process.argv[2];
const args    = process.argv.slice(3);
const PKG     = require('../package.json');

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

function readFile(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return stripBom(fs.readFileSync(filePath, 'utf8'));
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, Buffer.from((content || '').replace(/^\uFEFF/g, ''), 'utf8'));
}

function readCommons(rel) {
  return readFile(path.join(PKG_DIR, rel));
}

function readProject(rel) {
  return readFile(path.join(PROJECT, rel));
}

function join(...parts) {
  return parts.filter(Boolean).join('\n\n---\n\n');
}

function log(msg) {
  process.stdout.write('  ' + msg + '\n');
}

function header(msg) {
  process.stdout.write('\n  ' + msg + '\n  ' + '-'.repeat(msg.length) + '\n');
}

// ---------------------------------------------------------------------------
// Read MODULE_REGISTRY.md to identify which agents are relevant
// ---------------------------------------------------------------------------

function getRelevantAgents() {
  const registry = readProject('MODULE_REGISTRY.md') || '';
  const agentDir = path.join(PKG_DIR, 'agents');

  if (!fs.existsSync(agentDir)) return [];

  // Always include these core agents in CLAUDE.md regardless of project
  const coreAgents = [
    'ORCHESTRATOR_AGENT.md',
    'SPEC_WRITER_AGENT.md',
    'CODE_GEN_AGENT.md',
    'PEER_REVIEW_AGENT.md',
    'SECURITY_REVIEW_AGENT.md',
    'SECRETS_SCAN_AGENT.md',
    'STORY_DRAFTER_AGENT.md',
    'BUG_TRIAGE_AGENT.md',
  ];

  // Conditionally include based on project-layer file content
  const conditionalAgents = [];

  const kafkaTopics = readProject('KAFKA_TOPICS.md') || '';
  const hasKafka = kafkaTopics.length > 100 &&
    !kafkaTopics.includes('Not applicable') &&
    kafkaTopics.includes('topic');

  if (hasKafka) {
    conditionalAgents.push('KAFKA_SKILL_AGENT.md');
    conditionalAgents.push('EVENT_SCHEMA_AGENT.md');
  }

  const dataModel = readProject('DATA_MODEL.md') || '';
  const hasDatabase = dataModel.length > 100 &&
    dataModel.includes('table');

  if (hasDatabase) {
    conditionalAgents.push('DATA_MIGRATION_AGENT.md');
  }

  const techDebt = readProject('TECH_DEBT_REGISTRY.md') || '';
  const hasLegacy = registry.includes('Legacy') ||
    techDebt.includes('High');

  if (hasLegacy) {
    conditionalAgents.push('LEGACY_EXPLAINER_AGENT.md');
    conditionalAgents.push('REFACTOR_AGENT.md');
  }

  const integrationMap = readProject('INTEGRATION_MAP.md') || '';
  const hasIntegrations = integrationMap.length > 100;

  if (hasIntegrations) {
    conditionalAgents.push('DEPENDENCY_MAPPER_AGENT.md');
  }

  const sreConfig = readProject('SRE_SERVICE_CONFIG.md') || '';
  const hasSre = sreConfig.length > 100;

  if (hasSre) {
    conditionalAgents.push('SRE_AGENT.md');
    conditionalAgents.push('OBSERVABILITY_SETUP_AGENT.md');
  }

  // Build the final agent list -- core + conditional, deduped
  const allAgents = [...new Set([...coreAgents, ...conditionalAgents])];

  // Read each agent file and return content blocks with headers
  const blocks = [];
  for (const agentFile of allAgents) {
    const filePath = path.join(agentDir, agentFile);
    const content  = readFile(filePath);
    if (content) {
      blocks.push(content);
    }
  }

  return blocks;
}

// ---------------------------------------------------------------------------
// Generate .github/copilot-instructions.md
//
// Contents: AGENT.md + ARCHITECTURE_OVERVIEW + MODULE_REGISTRY
// Kept lean -- Copilot context window is smaller
// ---------------------------------------------------------------------------

function generateCopilot() {
  const outPath = path.join(CWD, '.github', 'copilot-instructions.md');
  const content = join(
    readCommons('foundation/AGENT.md'),
    readProject('ARCHITECTURE_OVERVIEW.md'),
    readProject('MODULE_REGISTRY.md')
  );
  writeFile(outPath, content);
  log('updated  .github/copilot-instructions.md');
}

// ---------------------------------------------------------------------------
// Generate CLAUDE.md
//
// Contents: AGENT.md + project-layer files + relevant agent skill files
// More comprehensive -- Claude Code has a larger context window
// ---------------------------------------------------------------------------

function generateClaude() {
  const outPath = path.join(CWD, 'CLAUDE.md');

  // Foundation and project context
  const foundationBlocks = [
    readCommons('foundation/AGENT.md'),
    readCommons('foundation/HITL_PROTOCOL.md'),
    readCommons('foundation/CODING_STANDARDS.md'),
    readProject('ARCHITECTURE_OVERVIEW.md'),
    readProject('MODULE_REGISTRY.md'),
    readProject('INTEGRATION_MAP.md'),
    readProject('DATA_MODEL.md'),
  ].filter(Boolean);

  // Relevant agent skill files (based on project-layer file content)
  const agentBlocks = getRelevantAgents();

  // Combine everything
  const allBlocks  = [...foundationBlocks, ...agentBlocks];
  const content    = allBlocks.join('\n\n---\n\n');

  writeFile(outPath, content);
  log('updated  CLAUDE.md (' + allBlocks.length + ' sections, ' +
    agentBlocks.length + ' agent skill files included)');
}

// ---------------------------------------------------------------------------
// Generate .cursorrules
//
// Contents: CODING_STANDARDS + project overrides
// ---------------------------------------------------------------------------

function generateCursor() {
  const outPath = path.join(CWD, '.cursorrules');
  const content = join(
    readCommons('foundation/CODING_STANDARDS.md'),
    readProject('OVERRIDES/CODING_STANDARDS.md')
  );
  writeFile(outPath, content || '');
  log('updated  .cursorrules');
}

// ---------------------------------------------------------------------------
// Write COMMONS_VERSION.md to .ai/project/
// ---------------------------------------------------------------------------

function writeVersion() {
  fs.mkdirSync(PROJECT, { recursive: true });
  writeFile(
    path.join(PROJECT, 'COMMONS_VERSION.md'),
    '# Commons version\n' +
    'Package: @telia-company/ai-engineering-common\n' +
    'Version: ' + PKG.version + '\n' +
    'Installed: ' + new Date().toISOString().split('T')[0] + '\n'
  );
}

// ---------------------------------------------------------------------------
// aec init
// ---------------------------------------------------------------------------

if (cmd === 'init') {
  header('aec v' + PKG.version + ' -- initialising project');

  fs.mkdirSync(PROJECT, { recursive: true });

  // Copy template files that do not already exist
  const tmplDir = path.join(PKG_DIR, 'templates', 'project-layer');
  if (fs.existsSync(tmplDir)) {
    const files   = fs.readdirSync(tmplDir).filter(f => f.endsWith('.md'));
    let   created = 0;
    for (const f of files) {
      const dest = path.join(PROJECT, f);
      if (!fs.existsSync(dest)) {
        const src = path.join(tmplDir, f);
        writeFile(dest, readFile(src) || '');
        log('created  .ai/project/' + f);
        created++;
      } else {
        log('exists   .ai/project/' + f + '  (skipped)');
      }
    }
    if (created === 0) {
      log('All project-layer files already exist. Run: npx aec update');
    }
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
  process.stdout.write('    5. Commit all generated files\n\n');
}

// ---------------------------------------------------------------------------
// aec update
// ---------------------------------------------------------------------------

else if (cmd === 'update') {
  header('aec -- regenerating tool configs');

  writeVersion();
  generateCopilot();
  generateClaude();
  generateCursor();

  process.stdout.write('\n  Done. Commit the updated files:\n');
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
    if (files.length === 0) return;
    process.stdout.write('\n  ' + label + ' (' + files.length + ' files)\n');
    for (const f of files) {
      process.stdout.write('    ' + f + '\n');
    }
  }

  if (scope === 'all' || scope === 'foundation') {
    listDir(path.join(PKG_DIR, 'foundation'), 'Foundation files');
  }
  if (scope === 'all' || scope === 'agents') {
    listDir(path.join(PKG_DIR, 'agents'), 'Agent skill files');
  }
  if (scope === 'all' || scope === 'commands') {
    listDir(path.join(PKG_DIR, 'commands'), 'Command files');
  }
  if (scope === 'all' || scope === 'sdlc') {
    const sdlcStages = ['planning', 'spec', 'engineering', 'qa', 'release', 'ops'];
    for (const stage of sdlcStages) {
      listDir(path.join(PKG_DIR, 'sdlc', stage), 'SDLC / ' + stage);
    }
  }

  process.stdout.write('\n  Usage: npx aec list [foundation|agents|commands|sdlc]\n\n');
}

// ---------------------------------------------------------------------------
// aec check
// ---------------------------------------------------------------------------

else if (cmd === 'check') {
  header('aec -- project-layer file validation');

  const requiredFiles = [
    'ARCHITECTURE_OVERVIEW.md',
    'MODULE_REGISTRY.md',
    'INTEGRATION_MAP.md',
    'DATA_MODEL.md',
    'TECH_DEBT_REGISTRY.md',
    'FEATURE_ENV_CONFIG.md',
    'SRE_SERVICE_CONFIG.md',
  ];

  // Placeholder markers that indicate a file has not been filled in
  const placeholderPatterns = [
    '[placeholder]',
    '[module-name]',
    '[team-name]',
    '# TODO',
    '{{INSTALL_DATE}}',
    '[Not yet created]',
  ];

  let issues  = 0;
  let missing = 0;

  process.stdout.write('\n');

  for (const file of requiredFiles) {
    const filePath = path.join(PROJECT, file);

    if (!fs.existsSync(filePath)) {
      process.stdout.write('  MISSING  ' + file + '\n');
      missing++;
      issues++;
      continue;
    }

    const content    = readFile(filePath) || '';
    const foundPH    = placeholderPatterns.filter(p => content.includes(p));
    const lineCount  = content.split('\n').length;

    if (lineCount < 10) {
      process.stdout.write('  EMPTY    ' + file + '  (' + lineCount + ' lines -- needs content)\n');
      issues++;
    } else if (foundPH.length > 0) {
      process.stdout.write('  STUB     ' + file + '  (contains placeholder: ' + foundPH[0] + ')\n');
      issues++;
    } else {
      process.stdout.write('  OK       ' + file + '\n');
    }
  }

  // Check for COMMONS_VERSION.md
  const versionFile = path.join(PROJECT, 'COMMONS_VERSION.md');
  if (!fs.existsSync(versionFile)) {
    process.stdout.write('  MISSING  COMMONS_VERSION.md  (run: npx aec update)\n');
    issues++;
  }

  process.stdout.write('\n');

  if (missing > 0) {
    process.stdout.write('  ' + missing + ' file(s) missing. Run: npx aec init\n\n');
  } else if (issues > 0) {
    process.stdout.write('  ' + issues + ' file(s) need attention.\n');
    process.stdout.write('  Fill in the placeholder content in .ai/project/ files,\n');
    process.stdout.write('  then run: npx aec update\n\n');
  } else {
    process.stdout.write('  All project-layer files look complete.\n');
    process.stdout.write('  Run: npx aec update  to regenerate tool configs.\n\n');
  }
}

// ---------------------------------------------------------------------------
// aec version / -v
// ---------------------------------------------------------------------------

else if (cmd === 'version' || cmd === '-v' || cmd === '--version') {
  process.stdout.write('  @telia-company/ai-engineering-common v' + PKG.version + '\n');
  process.stdout.write('  Node ' + process.version + '\n\n');
}

// ---------------------------------------------------------------------------
// No command / help
// ---------------------------------------------------------------------------

else {
  process.stdout.write('\n');
  process.stdout.write('  aec v' + PKG.version + ' -- AI Engineering Common CLI\n\n');
  process.stdout.write('  Commands:\n');
  process.stdout.write('    aec init              Bootstrap .ai/ folder in a new project\n');
  process.stdout.write('    aec update            Regenerate tool config files\n');
  process.stdout.write('    aec list [scope]      List commons files (foundation|agents|commands|sdlc)\n');
  process.stdout.write('    aec check             Validate .ai/project/ files are filled in\n');
  process.stdout.write('    aec version           Show installed version\n\n');
  process.stdout.write('  Typical workflow:\n');
  process.stdout.write('    1. npx aec init       (first time only)\n');
  process.stdout.write('    2. Fill in .ai/project/ files\n');
  process.stdout.write('    3. npx aec update     (after editing project files)\n');
  process.stdout.write('    4. npx aec check      (verify files are complete)\n\n');
}
