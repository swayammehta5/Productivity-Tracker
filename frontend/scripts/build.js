#!/usr/bin/env node

/**
 * Custom build script that directly imports the react-scripts build entrypoint.
 * This avoids shell execution so Linux executable bits are no longer required.
 * It also polyfills localStorage to prevent Node.js 20+ SecurityError during SSR builds.
 */

process.env.GENERATE_SOURCEMAP = 'false';
process.env.INLINE_RUNTIME_CHUNK = 'false';

const ensureWebStorage = () => {
  const createMemoryStorage = () => {
    const store = new Map();
    return {
      getItem: (key) => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => store.set(String(key), String(value)),
      removeItem: (key) => store.delete(key),
      clear: () => store.clear(),
      key: (index) => Array.from(store.keys())[index] ?? null,
      get length() {
        return store.size;
      }
    };
  };

  const defineStorage = (prop) => {
    Object.defineProperty(globalThis, prop, {
      value: createMemoryStorage(),
      configurable: true,
      writable: true
    });
  };

  ['localStorage', 'sessionStorage'].forEach((prop) => {
    let needsPolyfill = false;
    try {
      const storage = globalThis[prop];
      if (!storage) {
        needsPolyfill = true;
      } else {
        storage.length;
      }
    } catch (err) {
      needsPolyfill = true;
    }

    if (needsPolyfill) {
      defineStorage(prop);
    }
  });
};

ensureWebStorage();

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

