const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

// 1. Find the mobile app directory and the absolute root of the monorepo
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

// 2. Get the default Expo configuration
const config = getDefaultConfig(projectRoot);

// 3. Teach Metro to watch the entire monorepo so it can find @cra/shared
config.watchFolders = [workspaceRoot];

// 4. Tell Metro to look for node_modules in both the mobile folder AND the root folder
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// 5. Force Metro to resolve strictly from these paths to prevent duplicates
config.resolver.disableHierarchicalLookup = true;

// 6. Finally, wrap the fully configured monorepo setup with NativeWind
module.exports = withNativeWind(config, { input: "./global.css" });