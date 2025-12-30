/**
 * Extension Validator - Test extension files without loading into Chrome
 * Run with: node validate-extension.js
 */

const fs = require('fs');
const path = require('path');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

let errors = [];
let warnings = [];
let success = [];

// Check if file exists
function fileExists(filepath) {
  return fs.existsSync(filepath);
}

// Check if directory exists
function dirExists(dirpath) {
  return fs.existsSync(dirpath) && fs.lstatSync(dirpath).isDirectory();
}

// Read and parse JSON file
function readJSON(filepath) {
  try {
    const content = fs.readFileSync(filepath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

// Validate manifest.json
function validateManifest() {
  console.log('\n' + colors.blue + '=== Validating manifest.json ===' + colors.reset);
  
  const manifestPath = 'manifest.json';
  if (!fileExists(manifestPath)) {
    errors.push('manifest.json not found');
    return false;
  }
  
  const manifest = readJSON(manifestPath);
  if (!manifest) {
    errors.push('manifest.json is not valid JSON');
    return false;
  }
  
  // Check required fields
  const requiredFields = ['manifest_version', 'name', 'version', 'permissions'];
  for (const field of requiredFields) {
    if (!manifest[field]) {
      errors.push(`manifest.json missing required field: ${field}`);
    }
  }
  
  // Check manifest version
  if (manifest.manifest_version !== 3) {
    warnings.push('manifest_version should be 3 for Manifest V3');
  }
  
  // Check required files
  if (manifest.action && manifest.action.default_popup) {
    if (!fileExists(manifest.action.default_popup)) {
      errors.push(`Popup file not found: ${manifest.action.default_popup}`);
    }
  }
  
  if (manifest.background && manifest.background.service_worker) {
    if (!fileExists(manifest.background.service_worker)) {
      errors.push(`Background script not found: ${manifest.background.service_worker}`);
    }
  }
  
  if (manifest.options_page) {
    if (!fileExists(manifest.options_page)) {
      errors.push(`Options page not found: ${manifest.options_page}`);
    }
  }
  
  if (manifest.content_scripts) {
    for (const script of manifest.content_scripts) {
      if (script.js) {
        for (const jsFile of script.js) {
          if (!fileExists(jsFile)) {
            errors.push(`Content script not found: ${jsFile}`);
          }
        }
      }
    }
  }
  
  // Check icons
  if (manifest.icons) {
    const iconSizes = ['16', '48', '128'];
    for (const size of iconSizes) {
      if (manifest.icons[size] && !fileExists(manifest.icons[size])) {
        warnings.push(`Icon file not found: ${manifest.icons[size]} (extension will work but icon won't show)`);
      }
    }
  }
  
  if (errors.length === 0) {
    success.push('manifest.json is valid');
    console.log(colors.green + '✓ manifest.json is valid' + colors.reset);
  }
  
  return true;
}

// Validate file structure
function validateFileStructure() {
  console.log('\n' + colors.blue + '=== Validating File Structure ===' + colors.reset);
  
  const requiredFiles = [
    'manifest.json',
    'background.js',
    'content.js',
    'popup.html',
    'popup.css',
    'popup.js',
    'options.html',
    'options.css',
    'options.js'
  ];
  
  const requiredDirs = ['lib'];
  
  // Check required files
  for (const file of requiredFiles) {
    if (fileExists(file)) {
      success.push(`✓ ${file} exists`);
    } else {
      errors.push(`Required file missing: ${file}`);
      console.log(colors.red + `✗ Missing: ${file}` + colors.reset);
    }
  }
  
  // Check required directories
  for (const dir of requiredDirs) {
    if (dirExists(dir)) {
      success.push(`✓ ${dir}/ directory exists`);
    } else {
      errors.push(`Required directory missing: ${dir}/`);
      console.log(colors.red + `✗ Missing directory: ${dir}/` + colors.reset);
    }
  }
  
  // Check lib files
  const libFiles = [
    'lib/crypto-utils.js',
    'lib/auth-manager.js',
    'lib/storage-manager.js',
    'lib/profile-manager.js',
    'lib/custom-fields-manager.js',
    'lib/fuzzy-matcher.js'
  ];
  
  for (const file of libFiles) {
    if (fileExists(file)) {
      success.push(`✓ ${file} exists`);
    } else {
      errors.push(`Required lib file missing: ${file}`);
      console.log(colors.red + `✗ Missing: ${file}` + colors.reset);
    }
  }
  
  // Check icons directory
  if (dirExists('icons')) {
    success.push('✓ icons/ directory exists');
    const iconFiles = ['icons/icon16.png', 'icons/icon48.png', 'icons/icon128.png'];
    let iconsFound = 0;
    for (const icon of iconFiles) {
      if (fileExists(icon)) {
        iconsFound++;
      }
    }
    if (iconsFound === 0) {
      warnings.push('Icon files not found (extension will work but icons won\'t display)');
    } else if (iconsFound < 3) {
      warnings.push(`Only ${iconsFound}/3 icon files found`);
    } else {
      success.push('✓ All icon files exist');
    }
  } else {
    warnings.push('icons/ directory not found (extension will work but icons won\'t display)');
  }
}

// Check for basic JavaScript syntax errors
function validateJavaScriptSyntax() {
  console.log('\n' + colors.blue + '=== Checking JavaScript Syntax ===' + colors.reset);
  
  const jsFiles = [
    'background.js',
    'content.js',
    'popup.js',
    'options.js',
    'lib/crypto-utils.js',
    'lib/auth-manager.js',
    'lib/storage-manager.js',
    'lib/profile-manager.js',
    'lib/custom-fields-manager.js',
    'lib/fuzzy-matcher.js'
  ];
  
  for (const file of jsFiles) {
    if (!fileExists(file)) {
      continue; // Already reported as missing
    }
    
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      // Basic syntax checks
      // Check for unmatched brackets
      const openBraces = (content.match(/\{/g) || []).length;
      const closeBraces = (content.match(/\}/g) || []).length;
      if (openBraces !== closeBraces) {
        errors.push(`${file}: Unmatched braces (${openBraces} open, ${closeBraces} close)`);
        continue;
      }
      
      const openParens = (content.match(/\(/g) || []).length;
      const closeParens = (content.match(/\)/g) || []).length;
      if (openParens !== closeParens) {
        errors.push(`${file}: Unmatched parentheses`);
        continue;
      }
      
      // Check for basic class definitions
      if (file.includes('lib/') && !content.includes('class ')) {
        warnings.push(`${file}: Expected class definition not found`);
      }
      
      success.push(`✓ ${file} syntax looks valid`);
    } catch (error) {
      errors.push(`${file}: Error reading file - ${error.message}`);
    }
  }
}

// Check HTML files
function validateHTML() {
  console.log('\n' + colors.blue + '=== Checking HTML Files ===' + colors.reset);
  
  const htmlFiles = ['popup.html', 'options.html'];
  
  for (const file of htmlFiles) {
    if (!fileExists(file)) {
      continue;
    }
    
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      // Basic HTML checks
      if (!content.includes('<!DOCTYPE html>')) {
        warnings.push(`${file}: Missing DOCTYPE declaration`);
      }
      
      if (!content.includes('<html')) {
        errors.push(`${file}: Missing <html> tag`);
        continue;
      }
      
      if (!content.includes('<head')) {
        errors.push(`${file}: Missing <head> tag`);
        continue;
      }
      
      if (!content.includes('<body')) {
        errors.push(`${file}: Missing <body> tag`);
        continue;
      }
      
      // Check for script tags referencing JS files
      const scriptMatches = content.match(/<script[^>]*src=["']([^"']+)["']/g) || [];
      for (const match of scriptMatches) {
        const srcMatch = match.match(/src=["']([^"']+)["']/);
        if (srcMatch) {
          const srcFile = srcMatch[1];
          if (!fileExists(srcFile)) {
            errors.push(`${file}: Referenced script not found: ${srcFile}`);
          }
        }
      }
      
      // Check for CSS links
      const cssMatches = content.match(/<link[^>]*href=["']([^"']+\.css)["']/g) || [];
      for (const match of cssMatches) {
        const hrefMatch = match.match(/href=["']([^"']+\.css)["']/);
        if (hrefMatch) {
          const cssFile = hrefMatch[1];
          if (!fileExists(cssFile)) {
            errors.push(`${file}: Referenced stylesheet not found: ${cssFile}`);
          }
        }
      }
      
      success.push(`✓ ${file} structure looks valid`);
    } catch (error) {
      errors.push(`${file}: Error reading file - ${error.message}`);
    }
  }
}

// Main validation function
function runValidation() {
  console.log(colors.blue + '\n╔═══════════════════════════════════════╗');
  console.log('║   Filleasy Extension Validator   ║');
  console.log('╚═══════════════════════════════════════╝' + colors.reset);
  
  validateManifest();
  validateFileStructure();
  validateJavaScriptSyntax();
  validateHTML();
  
  // Print summary
  console.log('\n' + colors.blue + '=== Validation Summary ===' + colors.reset);
  
  if (success.length > 0) {
    console.log(colors.green + `\n✓ ${success.length} checks passed:` + colors.reset);
    success.slice(0, 10).forEach(msg => console.log(colors.green + '  ' + msg + colors.reset));
    if (success.length > 10) {
      console.log(colors.green + `  ... and ${success.length - 10} more` + colors.reset);
    }
  }
  
  if (warnings.length > 0) {
    console.log(colors.yellow + `\n⚠ ${warnings.length} warnings:` + colors.reset);
    warnings.forEach(warning => console.log(colors.yellow + '  ' + warning + colors.reset));
  }
  
  if (errors.length > 0) {
    console.log(colors.red + `\n✗ ${errors.length} errors found:` + colors.reset);
    errors.forEach(error => console.log(colors.red + '  ' + error + colors.reset));
    console.log(colors.red + '\n❌ Extension has errors that need to be fixed!' + colors.reset);
    process.exit(1);
  } else {
    console.log(colors.green + '\n✅ Extension structure looks good!' + colors.reset);
    if (warnings.length > 0) {
      console.log(colors.yellow + '⚠️  There are warnings but extension should work' + colors.reset);
    } else {
      console.log(colors.green + '🎉 Ready to load into Chrome!' + colors.reset);
    }
    process.exit(0);
  }
}

// Run validation
try {
  runValidation();
} catch (error) {
  console.error(colors.red + '\nFatal error during validation:' + colors.reset);
  console.error(error);
  process.exit(1);
}

