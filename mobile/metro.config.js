const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith("@shared/")) {
    const subpath = moduleName.replace("@shared/", "");
    return context.resolveRequest(
      context,
      path.resolve(workspaceRoot, "lib", subpath),
      platform,
    );
  }

  // Shared lib/ files use the Next.js @/ alias — resolve them from the repo root
  if (moduleName.startsWith("@/")) {
    const origin = context.originModulePath ?? "";
    const sharedLibRoot = path.join(workspaceRoot, "lib");
    const isFromSharedLib = origin.startsWith(sharedLibRoot + path.sep);

    if (isFromSharedLib) {
      return context.resolveRequest(
        context,
        path.resolve(workspaceRoot, moduleName.slice(2)),
        platform,
      );
    }
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
