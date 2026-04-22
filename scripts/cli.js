#!/usr/bin/env node
const fs   = require("fs");
const path = require("path");
const cmd  = process.argv[2];
const PKG  = require("../package.json");

const AI_DIR  = path.join(process.cwd(), ".ai");
const PROJECT = path.join(AI_DIR, "project");
const PKG_DIR = path.join(__dirname, "..");

function readFile(p) {
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null;
}
function readCommons(rel) { return readFile(path.join(PKG_DIR, rel)); }
function readProject(rel) { return readFile(path.join(PROJECT, rel)); }

function generateCopilot() {
  const out = path.join(process.cwd(), ".github", "copilot-instructions.md");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const content = [
    readCommons("foundation/AGENT.md"),
    readProject("ARCHITECTURE_OVERVIEW.md"),
    readProject("MODULE_REGISTRY.md"),
  ].filter(Boolean).join("\n\n---\n\n");
  fs.writeFileSync(out, content);
  console.log("  updated  .github/copilot-instructions.md");
}

function generateClaude() {
  const content = [
    readCommons("foundation/AGENT.md"),
    readProject("ARCHITECTURE_OVERVIEW.md"),
    readProject("MODULE_REGISTRY.md"),
    readProject("INTEGRATION_MAP.md"),
  ].filter(Boolean).join("\n\n---\n\n");
  fs.writeFileSync(path.join(process.cwd(), "CLAUDE.md"), content);
  console.log("  updated  CLAUDE.md");
}

function generateCursor() {
  const content = [
    readCommons("foundation/CODING_STANDARDS.md"),
    readProject("OVERRIDES/CODING_STANDARDS.md"),
  ].filter(Boolean).join("\n\n---\n\n");
  fs.writeFileSync(path.join(process.cwd(), ".cursorrules"), content || "");
  console.log("  updated  .cursorrules");
}

function writeVersion() {
  fs.mkdirSync(PROJECT, { recursive: true });
  fs.writeFileSync(
    path.join(PROJECT, "COMMONS_VERSION.md"),
    "# Commons version\nVersion: " + PKG.version +
    "\nInstalled: " + new Date().toISOString().split("T")[0] + "\n"
  );
}

if (cmd === "init") {
  console.log("\n  aec v" + PKG.version + " -- initialising project\n");
  fs.mkdirSync(PROJECT, { recursive: true });
  const tmpl = path.join(PKG_DIR, "templates", "project-layer");
  if (fs.existsSync(tmpl)) {
    fs.readdirSync(tmpl).forEach(function(f) {
      const dest = path.join(PROJECT, f);
      if (!fs.existsSync(dest)) {
        fs.copyFileSync(path.join(tmpl, f), dest);
        console.log("  created  .ai/project/" + f);
      }
    });
  }
  writeVersion();
  generateCopilot();
  generateClaude();
  generateCursor();
  console.log("\n  Done.\n");
  console.log("  Next: fill in these files in .ai\\project\\");
  console.log("    1. ARCHITECTURE_OVERVIEW.md");
  console.log("    2. MODULE_REGISTRY.md");
  console.log("    3. INTEGRATION_MAP.md\n");
  console.log("  Then run: npx aec update\n");
}

if (cmd === "update") {
  console.log("\n  aec -- regenerating tool configs\n");
  writeVersion();
  generateCopilot();
  generateClaude();
  generateCursor();
  console.log("\n  Done. Commit the updated config files.\n");
}

if (cmd === "version" || cmd === "-v") {
  console.log("  @YOUR_ORG/ai-engineering-commons v" + PKG.version);
}

if (!cmd) {
  console.log("\n  aec v" + PKG.version + "\n");
  console.log("  Commands:");
  console.log("    aec init      Bootstrap .ai/ folder in a new project");
  console.log("    aec update    Regenerate tool config files");
  console.log("    aec version   Show installed version\n");
}
