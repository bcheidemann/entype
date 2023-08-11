import {
  describe,
  it,
} from "https://deno.land/std@0.198.0/testing/bdd.ts";
import { assertSnapshot } from "https://deno.land/std@0.198.0/testing/snapshot.ts";
import { parseJson } from "./main.ts";
import { Json } from "./types.ts";

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
});
