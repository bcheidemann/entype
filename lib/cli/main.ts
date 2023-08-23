import "npm:@total-typescript/ts-reset";
import { Json } from "../types.ts";
import { parseJson } from "../parse.ts";
import { collapseTypes } from "../collapse-types.ts";
import { emitRootType } from "../emit/mod.ts";
import { isPromiseFulfilledResult, isPromiseRejectedResult } from "./util.ts";
import { loadPlugin } from "../plugins/mod.ts";
import { getVersion } from "../version.ts";
import { parseArgs } from "./parse-args.ts";

export async function main(
  runtime: "deno" | "node",
  args: string[],
): Promise<0 | 1> {
  const config = parseArgs(args);

  if ("help" in config) {
    if (runtime === "deno") {
      console.log(
        "Usage: entype --lang <rust|typescript> [files]\n",
      );
    } else {
      console.log(
        "Usage: node typegen-json --lang <rust|typescript> [files]\n",
      );
    }

    if ("message" in config) {
      console.error(config.message);
    }

    if (config.invalidArgs) {
      return 1;
    }

    return 0;
  }

  if ("version" in config) {
    console.log(getVersion());
    return 0;
  }

  if ("lang" in config) {
    let exitStatusCode: 0 | 1 = 0;

    const types = await Promise.allSettled(
      config.files.map(async (file) => {
        const json = await Deno.readTextFile(file);
        const obj = JSON.parse(json) as Json;
        return parseJson(obj);
      }),
    );

    if (types.some(isPromiseRejectedResult)) {
      console.error([
        "Failed to parse some files:",
        ...types.map((result, i) => {
          if (result.status === "fulfilled") {
            return `  ${config.files[i]}: OK`;
          } else {
            return `  ${config.files[i]}: ${result.reason}`;
          }
        }),
      ].join("\n"));
      exitStatusCode = 1;
    }

    const type = collapseTypes(
      types
        .filter(isPromiseFulfilledResult)
        .map((result) => result.value),
    );

    const plugins = await Promise.all(config.plugins.map(loadPlugin));

    await emitRootType(config.lang, type, plugins, console.log);

    return exitStatusCode;
  }

  throw new Error("Unreachable (received invalid config)");
}
