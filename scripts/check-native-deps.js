#!/usr/bin/env node
/**
 * Fail fast when platform-native CSS tooling is missing.
 * Common cause on Apple Silicon: node_modules installed under x64/Rosetta Node,
 * which pulls lightningcss-darwin-x64 instead of lightningcss-darwin-arm64.
 */
try {
  require("lightningcss");
} catch (err) {
  const arch = process.arch;
  const platform = process.platform;
  console.error("\nNative dependency check failed: lightningcss could not load.");
  console.error(`Current process: ${platform}/${arch}`);
  console.error(String(err && err.message ? err.message : err));
  console.error("\nFix (Apple Silicon / arm64):");
  console.error('  1. Confirm Node is arm64:  node -p "process.arch"');
  console.error("  2. Reinstall from the lockfile:");
  console.error("       rm -rf node_modules && npm ci");
  console.error("");
  process.exit(1);
}
