#!/usr/bin/env node

/**
 * Custom build script that directly imports the react-scripts build entrypoint.
 * This avoids shell execution so Linux executable bits are no longer required.
 */

process.env.GENERATE_SOURCEMAP = 'false';
process.env.INLINE_RUNTIME_CHUNK = 'false';

try {
  require.resolve('react-scripts/scripts/build');
} catch (err) {
  console.error('react-scripts is not installed. Did npm install fail?', err);
  process.exit(1);
}

try {
  require('react-scripts/scripts/build');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}

