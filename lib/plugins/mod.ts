import { Plugin, PluginName } from "./types.ts";

export async function loadPlugin(pluginName: PluginName): Promise<Plugin> {
  switch (pluginName) {
    case "derive-debug":
      return (await import("./derive-debug.ts")).plugin;
    case "serde-derive":
      return (await import("./serde-derive.ts")).plugin;
    default:
      return (await import(pluginName)).plugin;
  }
}
