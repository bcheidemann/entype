import { build, emptyDir } from "https://deno.land/x/dnt@0.38.1/mod.ts";
import { getVersion } from "../lib/version.ts";

await emptyDir("./npm");

await build({
  entryPoints: [{
    name: "typegen-json",
    path: "./npm-main.ts",
    kind: "bin",
  }, {
    name: "typegen-json",
    path: "./lib/mod.ts",
    kind: "export",
  }],
  outDir: "./npm",
  test: false,
  shims: {
    deno: true,
  },
  package: {
    name: "typegen-json",
    version: getVersion(),
    description:
      "CLI tool and library which generates types for serialized data formats.",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/bcheidemann/entype.git",
    },
    bugs: {
      url: "https://github.com/bcheidemann/entype/issues",
    },
    author: "Ben Heidemann <ben@heidemann.dev>",
  },
  postBuild() {
    Deno.copyFileSync("LICENSE", "npm/LICENSE");
    Deno.copyFileSync("README.md", "npm/README.md");
  },
});
