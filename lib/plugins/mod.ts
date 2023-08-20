import { Plugin, PluginName } from "./types.ts";

export const GITHUB_PLUGIN_PREFIX = "github:";

export async function loadPlugin(pluginName: PluginName): Promise<Plugin> {
  switch (pluginName) {
    case "derive-debug":
      return (await import("./derive-debug.ts")).plugin;
    case "serde-derive":
      return (await import("./serde-derive.ts")).plugin;
    default:
      return await loadThirdPartyPlugin(pluginName);
  }
}

export async function loadThirdPartyPlugin(
  pluginName: string,
): Promise<Plugin> {
  if (pluginName.startsWith(GITHUB_PLUGIN_PREFIX)) {
    return await loadGithubPlugin(pluginName);
  }

  return (await import(pluginName)).plugin;
}

export async function loadGithubPlugin(
  pluginName: string,
): Promise<Plugin> {
  const moduleSpecifier = pluginName.slice(GITHUB_PLUGIN_PREFIX.length);
  const [branch, rest] = moduleSpecifier.includes("@")
    ? moduleSpecifier.split("@")
    : [null, moduleSpecifier];
  const [owner, repo, ...path] = rest.split("/");

  const { plugin } = await import(
    `https://raw.githubusercontent.com/${owner}/${repo}/${branch || "main"}/${
      path ? path.join("/") : "mod.ts"
    }`
  );

  return plugin;
}
