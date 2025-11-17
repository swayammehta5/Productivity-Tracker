#!/usr/bin/env node

// Custom build script to avoid permission issues
process.env.GENERATE_SOURCEMAP = 'false';
process.env.INLINE_RUNTIME_CHUNK = 'false';

const { execSync } = require('child_process');
const path = require('path');

try {
  // Use npm to run react-scripts, which handles path resolution correctly
  const result = execSync('npm exec -- react-scripts build', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
    env: { ...process.env }
  });
  process.exit(0);
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(error.status || 1);
}

