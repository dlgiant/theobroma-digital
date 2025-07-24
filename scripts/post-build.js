#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('Post-build script: Replacing root index.html with custom redirect...');

const sourcePath = path.join(__dirname, '..', 'public', 'index-fallback.html');
const targetPath = path.join(__dirname, '..', 'out', 'index.html');

try {
  // Check if custom index exists
  if (!fs.existsSync(sourcePath)) {
    console.log('Custom index-fallback.html not found, skipping replacement.');
    process.exit(0);
  }

  // Check if out directory exists
  if (!fs.existsSync(path.dirname(targetPath))) {
    console.log('Output directory does not exist, skipping replacement.');
    process.exit(0);
  }

  // Copy the custom index over the generated one
  fs.copyFileSync(sourcePath, targetPath);
  
  console.log('✅ Successfully replaced index.html with custom redirect page.');
} catch (error) {
  console.error('❌ Error replacing index.html:', error.message);
  process.exit(1);
}
