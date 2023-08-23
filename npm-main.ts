import { main } from "./lib/cli/mod.ts";

main("node", Deno.args)
  .then((code) => Deno.exit(code));
