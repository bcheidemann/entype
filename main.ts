import { main } from "./lib/cli/mod.ts";

if (import.meta.main) {
  const code = await main("deno", Deno.args);
  Deno.exit(code);
}
