#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Installation script for commit-triggered version bumping system
 * This script copies the post-commit hook to .git/hooks/ and makes it executable
 */

function log(message) {
  console.log(`[Install] ${message}`);
}

function error(message) {
  console.error(`[Install Error] ${message}`);
}

function checkGitRepository() {
  try {
    execSync('git rev-parse --git-dir', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

function getGitHooksDirectory() {
  try {
    const gitDir = execSync('git rev-parse --git-dir', { encoding: 'utf8' }).trim();
    return path.join(gitDir, 'hooks');
  } catch (e) {
    throw new Error('Failed to locate Git hooks directory');
  }
}

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    try {
      fs.mkdirSync(dirPath, { recursive: true });
      log(`Created directory: ${dirPath}`);
    } catch (e) {
      throw new Error(`Failed to create directory ${dirPath}: ${e.message}`);
    }
  }
}

function copyHookFile(sourcePath, targetPath) {
  try {
    const hookContent = fs.readFileSync(sourcePath, 'utf8');
    fs.writeFileSync(targetPath, hookContent);
    log(`Copied hook from ${sourcePath} to ${targetPath}`);
  } catch (e) {
    throw new Error(`Failed to copy hook file: ${e.message}`);
  }
}

function makeExecutable(filePath) {
  try {
    fs.chmodSync(filePath, 0o755);
    log(`Made ${filePath} executable`);
  } catch (e) {
    throw new Error(`Failed to make ${filePath} executable: ${e.message}`);
  }
}

function checkVersionBumpScript() {
  const scriptPath = path.join(process.cwd(), 'scripts', 'version-bump.js');
  if (!fs.existsSync(scriptPath)) {
    throw new Error(`Version bump script not found at ${scriptPath}`);
  }
  log(`Version bump script found at ${scriptPath}`);
}

function checkNodeJs() {
  try {
    execSync('node --version', { stdio: 'ignore' });
    log('Node.js is available');
  } catch (e) {
    error('Warning: Node.js not found. The version bump system requires Node.js to function.');
  }
}

function backupExistingHook(hookPath) {
  if (fs.existsSync(hookPath)) {
    const backupPath = `${hookPath}.backup.${Date.now()}`;
    try {
      fs.copyFileSync(hookPath, backupPath);
      log(`Backed up existing hook to ${backupPath}`);
    } catch (e) {
      error(`Warning: Failed to backup existing hook: ${e.message}`);
    }
  }
}

function main() {
  try {
    log('Starting installation of commit-triggered version bumping system...');

    // Check if we're in a Git repository
    if (!checkGitRepository()) {
      throw new Error('Not in a Git repository. Please run this script from the root of a Git repository.');
    }

    // Check if Node.js is available
    checkNodeJs();

    // Check if version bump script exists
    checkVersionBumpScript();

    // Get paths
    const sourceHookPath = path.join(process.cwd(), 'scripts', 'post-commit');
    const hooksDir = getGitHooksDirectory();
    const targetHookPath = path.join(hooksDir, 'post-commit');

    // Check if source hook exists
    if (!fs.existsSync(sourceHookPath)) {
      throw new Error(`Post-commit hook not found at ${sourceHookPath}`);
    }

    // Ensure hooks directory exists
    ensureDirectoryExists(hooksDir);

    // Backup existing hook if it exists
    backupExistingHook(targetHookPath);

    // Copy hook file
    copyHookFile(sourceHookPath, targetHookPath);

    // Make hook executable
    makeExecutable(targetHookPath);

    log('Installation completed successfully!');
    log('');
    log('The version bumping system is now active. Use these commit message prefixes:');
    log('  - "patch: your message" - increments patch version (x.y.Z)');
    log('  - "minor: your message" - increments minor version (x.Y.0)');
    log('  - "major: your message" - increments major version (X.0.0)');
    log('');
    log('Commits without these prefixes will not trigger version changes.');

  } catch (e) {
    error(e.message);
    process.exit(1);
  }
}

// CLI usage
if (require.main === module) {
  main();
}

module.exports = {
  checkGitRepository,
  getGitHooksDirectory,
  ensureDirectoryExists,
  copyHookFile,
  makeExecutable,
  checkVersionBumpScript,
  main
};