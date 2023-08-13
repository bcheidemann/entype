import "npm:@total-typescript/ts-reset";
import { Json, Type } from "./lib/types.ts";
import { parseJson } from "./lib/parse.ts";
import { collapseTypes } from "./lib/collapse-types.ts";
import { emitRootType } from "./lib/emit/mod.ts";

if (import.meta.main) {
  if (Deno.args.includes("--help") || Deno.args.includes("-h")) {
    console.log("Usage: deno run --allow-read main.ts <files>");
    Deno.exit(0);
  }
  const types = new Array<Type>();
  for await (const file of Deno.args) {
    const json = await Deno.readTextFile(file);
    const obj = JSON.parse(json) as Json;
    types.push(parseJson(obj));
  }
  const type = collapseTypes(types);
  emitRootType("rust", type, console.log);
}
