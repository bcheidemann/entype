import "npm:@total-typescript/ts-reset";
import { collapseTypes } from "./lib/collapse-types.ts";
import { emitRootTypeToString } from "./lib/emit/mod.ts";
import { parseJson } from "./lib/parse.ts";
import { Json } from "./lib/types.ts";

const blockstateFiles = Deno.readDir("./fixtures/datapack/blockstates");
const blockstateInputs = new Array<string>();
for await (const file of blockstateFiles) {
  blockstateInputs.push(
    await Deno.readTextFile(
      `./fixtures/datapack/blockstates/${file.name}`,
    ),
  );
}

Deno.bench("datapack/blockstates - no disk", async () => {
  const type = collapseTypes(
    blockstateInputs.map((input) => parseJson(JSON.parse(input) as Json)),
  );
  await emitRootTypeToString("rust", type, []);
});

const blockModelFiles = Deno.readDir("./fixtures/datapack/models/block");
const itemModelFiles = Deno.readDir("./fixtures/datapack/models/item");
const modelInputs = new Array<string>();
for await (const file of blockModelFiles) {
  modelInputs.push(
    await Deno.readTextFile(
      `./fixtures/datapack/models/block/${file.name}`,
    ),
  );
}
for await (const file of itemModelFiles) {
  modelInputs.push(
    await Deno.readTextFile(
      `./fixtures/datapack/models/item/${file.name}`,
    ),
  );
}

Deno.bench("datapack/models - no disk", async () => {
  const type = collapseTypes(
    modelInputs.map((input) => parseJson(JSON.parse(input) as Json)),
  );
  await emitRootTypeToString("rust", type, []);
});

Deno.bench("datapack/blockstates", async () => {
  const blockstateFiles = Deno.readDir("./fixtures/datapack/blockstates");
  const blockstateInputs = new Array<string>();
  for await (const file of blockstateFiles) {
    blockstateInputs.push(
      await Deno.readTextFile(
        `./fixtures/datapack/blockstates/${file.name}`,
      ),
    );
  }

  const type = collapseTypes(
    blockstateInputs.map((input) => parseJson(JSON.parse(input) as Json)),
  );
  await emitRootTypeToString("rust", type, []);
});

Deno.bench("datapack/models", async () => {
  const blockModelFiles = Deno.readDir("./fixtures/datapack/models/block");
  const itemModelFiles = Deno.readDir("./fixtures/datapack/models/item");
  const modelInputs = new Array<string>();
  for await (const file of blockModelFiles) {
    modelInputs.push(
      await Deno.readTextFile(
        `./fixtures/datapack/models/block/${file.name}`,
      ),
    );
  }
  for await (const file of itemModelFiles) {
    modelInputs.push(
      await Deno.readTextFile(
        `./fixtures/datapack/models/item/${file.name}`,
      ),
    );
  }

  const type = collapseTypes(
    modelInputs.map((input) => parseJson(JSON.parse(input) as Json)),
  );
  await emitRootTypeToString("rust", type, []);
});
