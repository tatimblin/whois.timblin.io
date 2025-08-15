#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Parse commit message to extract version bump type
 * @param {string} message - The commit message
 * @returns {string|null} - 'patch', 'minor', 'major', or null
 */
function parseCommitMessage(message) {
  if (!message || typeof message !== 'string') {
    return null;
  }

  const trimmedMessage = message.trim().toLowerCase();
  
  if (trimmedMessage.startsWith('patch:')) {
    return 'patch';
  } else if (trimmedMessage.startsWith('minor:')) {
    return 'minor';
  } else if (trimmedMessage.startsWith('major:')) {
    return 'major';
  }
  
  return null;
}

/**
 * Read current version from package.json
 * @returns {string} - Current version string
 */
function getCurrentVersion() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error('package.json not found');
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    return packageJson.version || '1.0.0';
  } catch (error) {
    throw new Error(`Invalid JSON in package.json: ${error.message}`);
  }
}

/**
 * Parse version string into components
 * @param {string} version - Version string (e.g., "1.2.3")
 * @returns {object} - Version components
 */
function parseVersion(version) {
  const versionRegex = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
  const match = version.match(versionRegex);
  
  if (!match) {
    // If version is invalid, return default version components
    return {
      major: 1,
      minor: 0,
      patch: 0,
      prerelease: null,
      build: null,
      raw: '1.0.0'
    };
  }

  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[4] || null,
    build: match[5] || null,
    raw: version
  };
}

/**
 * Increment version based on bump type
 * @param {string} currentVersion - Current version string
 * @param {string} bumpType - 'patch', 'minor', or 'major'
 * @returns {string} - New version string
 */
function incrementVersion(currentVersion, bumpType) {
  const versionObj = parseVersion(currentVersion);
  
  switch (bumpType) {
    case 'patch':
      versionObj.patch += 1;
      break;
    case 'minor':
      versionObj.minor += 1;
      versionObj.patch = 0;
      break;
    case 'major':
      versionObj.major += 1;
      versionObj.minor = 0;
      versionObj.patch = 0;
      break;
    default:
      throw new Error(`Invalid bump type: ${bumpType}`);
  }

  // Construct new version string, preserving prerelease and build metadata if present
  let newVersion = `${versionObj.major}.${versionObj.minor}.${versionObj.patch}`;
  
  if (versionObj.prerelease) {
    newVersion += `-${versionObj.prerelease}`;
  }
  
  if (versionObj.build) {
    newVersion += `+${versionObj.build}`;
  }

  return newVersion;
}

/**
 * Update package.json with new version
 * @param {string} newVersion - New version string
 */
function updatePackageJson(newVersion) {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error('package.json not found');
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    packageJson.version = newVersion;
    
    // Write back with proper formatting
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  } catch (error) {
    throw new Error(`Failed to update package.json: ${error.message}`);
  }
}

/**
 * Main function to handle version bumping
 * @param {string} commitMessage - The commit message to parse
 * @returns {object} - Result object with success status and details
 */
function main(commitMessage) {
  const result = {
    success: false,
    newVersion: null,
    currentVersion: null,
    skipped: false,
    error: null,
    commitMessage: commitMessage,
    bumpType: null
  };

  try {
    // Parse commit message for version bump type
    const bumpType = parseCommitMessage(commitMessage);
    
    if (!bumpType) {
      result.skipped = true;
      result.success = true;
      return result;
    }

    result.bumpType = bumpType;

    // Get current version
    const currentVersion = getCurrentVersion();
    result.currentVersion = currentVersion;
    
    // Increment version
    const newVersion = incrementVersion(currentVersion, bumpType);
    
    // Update package.json
    updatePackageJson(newVersion);
    
    result.success = true;
    result.newVersion = newVersion;
    
    return result;
    
  } catch (error) {
    result.error = error.message;
    return result;
  }
}

// CLI usage
if (require.main === module) {
  const commitMessage = process.argv[2];
  
  if (!commitMessage) {
    console.error('Usage: node version-bump.js "<commit-message>"');
    process.exit(1);
  }

  const result = main(commitMessage);
  
  if (result.error) {
    console.error(`Error: ${result.error}`);
    process.exit(1);
  }
  
  if (result.skipped) {
    console.log('No version prefix found in commit message. Skipping version bump.');
    process.exit(0);
  }
  
  console.log(`Version bumped from ${result.currentVersion} to ${result.newVersion} (${result.bumpType})`);
  process.exit(0);
}

module.exports = {
  parseCommitMessage,
  getCurrentVersion,
  parseVersion,
  incrementVersion,
  updatePackageJson,
  main
};