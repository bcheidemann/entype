import "npm:@total-typescript/ts-reset";
import { describe, it } from "https://deno.land/std@0.198.0/testing/bdd.ts";
import { assertSnapshot } from "https://deno.land/std@0.198.0/testing/snapshot.ts";
import { collapseTypes } from "./lib/collapse-types.ts";
import { emitTypes } from "./lib/emit/rust.ts";
import { parseJson } from "./lib/parse.ts";
import { Json, Type } from "./lib/types.ts";

describe("parseJson", () => {
  async function run(
    ctx: Deno.TestContext,
    filename: string,
  ) {
    const json = await Deno.readTextFile(`./fixtures/${filename}`);
    const obj = JSON.parse(json) as Json;
    const type = parseJson(obj);
    await assertSnapshot(ctx, type);
  }

  it("parses array-0.json", async (ctx) => {
    await run(ctx, "array-0.json");
  });

  it("parses array-1.json", async (ctx) => {
    await run(ctx, "array-1.json");
  });

  it("parses array-2.json", async (ctx) => {
    await run(ctx, "array-2.json");
  });

  it("parses array-3.json", async (ctx) => {
    await run(ctx, "array-3.json");
  });

  it("parses array-4.json", async (ctx) => {
    await run(ctx, "array-4.json");
  });

  it("parses boolean-false.json", async (ctx) => {
    await run(ctx, "boolean-false.json");
  });

  it("parses boolean-true.json", async (ctx) => {
    await run(ctx, "boolean-true.json");
  });

  it("parses map-0.json", async (ctx) => {
    await run(ctx, "map-0.json");
  });

  it("parses map-1.json", async (ctx) => {
    await run(ctx, "map-1.json");
  });

  it("parses map-2.json", async (ctx) => {
    await run(ctx, "map-2.json");
  });

  it("parses null.json", async (ctx) => {
    await run(ctx, "null.json");
  });

  it("parses number-negative.json", async (ctx) => {
    await run(ctx, "number-negative.json");
  });

  it("parses number-positive.json", async (ctx) => {
    await run(ctx, "number-positive.json");
  });

  it("parses number-zero.json", async (ctx) => {
    await run(ctx, "number-zero.json");
  });

  it("parses object-0.json", async (ctx) => {
    await run(ctx, "object-0.json");
  });

  it("parses object-1.json", async (ctx) => {
    await run(ctx, "object-1.json");
  });

  it("parses object-2.json", async (ctx) => {
    await run(ctx, "object-2.json");
  });

  it("parses object-3.json", async (ctx) => {
    await run(ctx, "object-3.json");
  });

  it("parses object-4.json", async (ctx) => {
    await run(ctx, "object-4.json");
  });

  it("parses object-5.json", async (ctx) => {
    await run(ctx, "object-5.json");
  });

  it("parses object-6.json", async (ctx) => {
    await run(ctx, "object-6.json");
  });

  it("parses object-7.json", async (ctx) => {
    await run(ctx, "object-7.json");
  });

  it("parses object-8.json", async (ctx) => {
    await run(ctx, "object-8.json");
  });

  it("parses regression-0-option-option.json", async (ctx) => {
    await run(ctx, "regression-0-option-option.json");
  });
});

describe("emitTypes", () => {
  async function run(
    ctx: Deno.TestContext,
    filename: string,
  ) {
    const json = await Deno.readTextFile(`./fixtures/${filename}`);
    const obj = JSON.parse(json) as Json;
    const type = parseJson(obj);
    const code = emitTypes(type);
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
});

describe("Parse Multiple Files", () => {
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
    await assertSnapshot(ctx, type);
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

describe("Emit Multiple Files", () => {
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
    const code = emitTypes(type);
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
