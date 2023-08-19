import "npm:@total-typescript/ts-reset";
import { describe, it } from "https://deno.land/std@0.198.0/testing/bdd.ts";
import { assertSnapshot } from "https://deno.land/std@0.198.0/testing/snapshot.ts";
import { parseJson } from "../parse.ts";
import { Json, Type } from "../types.ts";
import { collapseTypes } from "../collapse-types.ts";
import { emitRootTypeToString } from "../emit/mod.ts";
import { loadPlugin } from "./mod.ts";

describe("Serde Derive Plugin", () => {
  async function run(
    ctx: Deno.TestContext,
    filename: string,
  ) {
    const json = await Deno.readTextFile(`./fixtures/${filename}`);
    const obj = JSON.parse(json) as Json;
    const type = parseJson(obj);
    const plugins = [await loadPlugin("serde-derive")];
    const code = await emitRootTypeToString("rust", type, plugins);
    await assertSnapshot(ctx, code);
  }

  it("emit array-0.json", async (ctx) => {
    await run(ctx, "array-0.json");
  });

  it("emit array-1.json", async (ctx) => {
    await run(ctx, "array-1.json");
  });

  it("emit array-2.json", async (ctx) => {
    await run(ctx, "array-2.json");
  });

  it("emit array-3.json", async (ctx) => {
    await run(ctx, "array-3.json");
  });

  it("emit array-4.json", async (ctx) => {
    await run(ctx, "array-4.json");
  });

  it("emit boolean-false.json", async (ctx) => {
    await run(ctx, "boolean-false.json");
  });

  it("emit boolean-true.json", async (ctx) => {
    await run(ctx, "boolean-true.json");
  });

  it("emit map-0.json", async (ctx) => {
    await run(ctx, "map-0.json");
  });

  it("emit map-1.json", async (ctx) => {
    await run(ctx, "map-1.json");
  });

  it("emit map-2.json", async (ctx) => {
    await run(ctx, "map-2.json");
  });

  it("emit null.json", async (ctx) => {
    await run(ctx, "null.json");
  });

  it("emit number-negative.json", async (ctx) => {
    await run(ctx, "number-negative.json");
  });

  it("emit number-positive.json", async (ctx) => {
    await run(ctx, "number-positive.json");
  });

  it("emit number-zero.json", async (ctx) => {
    await run(ctx, "number-zero.json");
  });

  it("emit object-0.json", async (ctx) => {
    await run(ctx, "object-0.json");
  });

  it("emit object-1.json", async (ctx) => {
    await run(ctx, "object-1.json");
  });

  it("emit object-2.json", async (ctx) => {
    await run(ctx, "object-2.json");
  });

  it("emit object-3.json", async (ctx) => {
    await run(ctx, "object-3.json");
  });

  it("emit object-4.json", async (ctx) => {
    await run(ctx, "object-4.json");
  });

  it("emit object-5.json", async (ctx) => {
    await run(ctx, "object-5.json");
  });

  it("emit object-6.json", async (ctx) => {
    await run(ctx, "object-6.json");
  });

  it("emit object-7.json", async (ctx) => {
    await run(ctx, "object-7.json");
  });

  it("emit object-8.json", async (ctx) => {
    await run(ctx, "object-8.json");
  });

  it("parses regression-0-option-option.json", async (ctx) => {
    await run(ctx, "regression-0-option-option.json");
  });

  describe("Multiple-Files", () => {
    async function run(
      ctx: Deno.TestContext,
      directory: string,
    ) {
      const files = Deno.readDir(`./fixtures/${directory}`);
      const types = new Array<Type>();
      for await (const file of files) {
        const json = await Deno.readTextFile(
          `./fixtures/${directory}/${file.name}`,
        );
        const obj = JSON.parse(json) as Json;
        types.push(parseJson(obj));
      }
      const type = collapseTypes(types);
      const plugins = [await loadPlugin("serde-derive")];
      const code = await emitRootTypeToString("rust", type, plugins);
      await assertSnapshot(ctx, code);
    }

    it("datapack/blockstates", async (ctx) => {
      await run(ctx, "datapack/blockstates");
    });

    it("datapack/models/block", async (ctx) => {
      await run(ctx, "datapack/models/block");
    });

    it("datapack/models/item", async (ctx) => {
      await run(ctx, "datapack/models/item");
    });
  });
});
