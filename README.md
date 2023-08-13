# Entype

Entype is a CLI tool and library which ingests serialized data formats
(currently only JSON) and outputs type definitions for different languages
(currently Rust and TypeScript).

## Installation

Entype can be installed using the Deno CLI:

```sh
deno install --allow-read https://deno.land/x/entype/main.ts
```

And can then be run using the `entype` commands:

```sh
entype --lang rust fixtures/datapack/blockstates/*.json
```

Alternatively, it can be run using the Deno CLI without the need to install the
command globally:

```sh
deno run --allow-read https://deno.land/x/entype/main.ts --lang rust fixtures/datapack/blockstates/*.json
```

## Usage

Entype accepts files to generate type definitions for and emits type definitions
to stdout.

```sh
entype --lang typescript fixtures/datapack/blockstates/*.json
```

The above example will output the following TypeScript type definitions:

```ts
export type ArrayElement5 = {
  model: string;
  uvlock: boolean | null | undefined;
  weight: number | null | undefined;
  x: number | null | undefined;
  y: number | null | undefined;
};

export type Struct15 = {
  model: string;
  uvlock: boolean | null | undefined;
  x: number | null | undefined;
  y: number | null | undefined;
};

export type Apply3 =
  | Array<ArrayElement5>
  | Struct15;

export type TElement29 = {
  facing: string | null | undefined;
  slot_0_occupied: string | null | undefined;
  slot_1_occupied: string | null | undefined;
  slot_2_occupied: string | null | undefined;
  slot_3_occupied: string | null | undefined;
  slot_4_occupied: string | null | undefined;
  slot_5_occupied: string | null | undefined;
};

export type TElement66 = {
  east: string | null | undefined;
  north: string | null | undefined;
  south: string | null | undefined;
  up: string | null | undefined;
  west: string | null | undefined;
};

export type T24 = {
  age: string | null | undefined;
  AND: Array<TElement29> | null | undefined;
  down: string | null | undefined;
  east: string | null | undefined;
  facing: string | null | undefined;
  flower_amount: string | null | undefined;
  has_bottle_0: string | null | undefined;
  has_bottle_1: string | null | undefined;
  has_bottle_2: string | null | undefined;
  leaves: string | null | undefined;
  level: string | null | undefined;
  north: string | null | undefined;
  OR: Array<TElement66> | null | undefined;
  south: string | null | undefined;
  up: string | null | undefined;
  west: string | null | undefined;
};

export type TElement2 = {
  apply: Apply3;
  when: T24 | null | undefined;
};

export type ArrayElement87 = {
  model: string;
  x: number | null | undefined;
  y: number | null | undefined;
};

export type Struct93 = {
  model: string;
  uvlock: boolean | null | undefined;
  x: number | null | undefined;
  y: number | null | undefined;
};

export type TEntry85 =
  | Array<ArrayElement87>
  | Struct93;

export type Root = {
  multipart: Array<TElement2> | null | undefined;
  variants: Record<string, TEntry85> | null | undefined;
};
```

Alternatively, Rust types can be generated as follows:

```sh
entype --lang rust fixtures/datapack/blockstates/*.json
```

```rust
pub struct ArrayElement5 {
  model: String,
  uvlock: Option<bool>,
  weight: Option<f64>,
  x: Option<f64>,
  y: Option<f64>,
}

pub struct Struct15 {
  model: String,
  uvlock: Option<bool>,
  x: Option<f64>,
  y: Option<f64>,
}

pub enum Apply3 {
  Array(Vec<ArrayElement5>),
  Struct(Struct15),
}

pub struct TElement29 {
  facing: Option<String>,
  slot_0_occupied: Option<String>,
  slot_1_occupied: Option<String>,
  slot_2_occupied: Option<String>,
  slot_3_occupied: Option<String>,
  slot_4_occupied: Option<String>,
  slot_5_occupied: Option<String>,
}

pub struct TElement66 {
  east: Option<String>,
  north: Option<String>,
  south: Option<String>,
  up: Option<String>,
  west: Option<String>,
}

pub struct T24 {
  age: Option<String>,
  AND: Option<Vec<TElement29>>,
  down: Option<String>,
  east: Option<String>,
  facing: Option<String>,
  flower_amount: Option<String>,
  has_bottle_0: Option<String>,
  has_bottle_1: Option<String>,
  has_bottle_2: Option<String>,
  leaves: Option<String>,
  level: Option<String>,
  north: Option<String>,
  OR: Option<Vec<TElement66>>,
  south: Option<String>,
  up: Option<String>,
  west: Option<String>,
}

pub struct TElement2 {
  apply: Apply3,
  when: Option<T24>,
}

pub struct ArrayElement87 {
  model: String,
  x: Option<f64>,
  y: Option<f64>,
}

pub struct Struct93 {
  model: String,
  uvlock: Option<bool>,
  x: Option<f64>,
  y: Option<f64>,
}

pub enum TEntry85 {
  Array(Vec<ArrayElement87>),
  Struct(Struct93),
}

pub struct Root {
  multipart: Option<Vec<TElement2>>,
  variants: Option<std::collections::HashMap<String, TEntry85>>,
}
```

## How it works

Entype tries to generate the simplest possible type that accurately describes
the input data. For instance, given the following two input files:

```jsonc
// 200.json
{
  "statusCode": 200,
  "data": {
    "message": "Hello World!"
  }
}
```

```jsonc
// 500.json
{
  "statusCode": 500,
  "error": {
    "message": "An internal server error occurred"
  }
}
```

Entype will first generate an intermediate representation for the first file
(200.json). If emitted to TypeScript, it would look something like this:

```typescript
export type Data0 = {
  message: string;
};

export type Root = {
  data: Data0;
  statusCode: number;
};
```

It then generates an intermediate representation for the second file (500.json),
which looks something like this:

```typescript
export type Error0 = {
  message: string;
};

export type Root = {
  error: Error0;
  statusCode: number;
};
```

Next it compares each field in the generated types recursively, producing the
simplest type for each field which accurately describes both input files. This
produces a final intermediate type representation, which can then be emitted to
the following TypeScript type definition:

```typescript
export type T1 = {
  message: string;
};

export type T4 = {
  message: string;
};

export type Root = {
  data: T1 | null | undefined;
  error: T4 | null | undefined;
  statusCode: number;
};
```

This process can be repeated for an arbitrary number of input files.

## Motivation

This tool was constructed to help produce Rust type definitions for the
Minecraft datapack format. However, it is useful for a wide variety of
applications. The following are some potential use case:

1. Generating types for production no SQL databases, where the schema has varied
   over time
2. Generating complex API response types where the underlying type is unknown
   but a large amount of sample responses can be obtained

## Design decisions

### Avoiding unions

Envault prefers to avoid unions where they are not necessary. For example, given
these input files:

```jsonc
// 200.json
{
  "statusCode": 200,
  "data": {
    "message": "Hello World!"
  }
}
```

```jsonc
// 500.json
{
  "statusCode": 500,
  "error": {
    "message": "An internal server error occurred"
  }
}
```

It is possible to generate two distinct types which accurately describe the
provided data:

```typescript
// With union
export type T1 = {
  message: string;
};

export type T4 = {
  message: string;
};

export type Root =
  | {
    data: T1;
    statusCode: number;
  }
  | {
    error: T4;
    statusCode: number;
  };

// Without union
export type T1 = {
  message: string;
};

export type T4 = {
  message: string;
};

export type Root = {
  data: T1 | null | undefined;
  error: T4 | null | undefined;
  statusCode: number;
};
```

In this case, entype will generate the type without a union. This is for two
reasons:

1. The type is more robust (a new input with both `data` and `error` would not
   contradict the generated type)
2. A preference for unions would potentially generate many variants where there
   are lots of optional fields (like in the Minecraft datapack format)

It is possible to make this configurable, and I would consider implementing such
functionality in future (or accepting a PR) if there is demand and a suitable
proposal for the API design.

## Supported formats and languages

Entype currently sypports JSON as an input format and Rust/Typescript as output
formats. Other output formats are trivial to implement and PRs are welcome. Some
minor refactoring and API changes are needed to support other input formats, but
PRs are also welcome to add support for these.

## Limitations

### Naming

Since entype has limited context, it will not generate descriptive type names.
It is generally recommended (though not required) to manually rename types after
generation.

### Performance

Entype is written in TypeScript and is not optimised for performance. This is a
deliberate decision, which was made for the following reasons:

1. It is already fast (see the benchmarks)
2. It is intended for one-off use

If you measure your input data in GigaBytes rather than MegaBytes, no guarantees
are made as to the performance.

## Benchmarks

The following are the results of running `deno bench --allow-read`:

```
benchmark                           time (avg)             (min … max)       p75       p99      p995
---------------------------------------------------------------------- -----------------------------
datapack/blockstates - no disk       9.94 ms/iter     (9.56 ms … 10.7 ms)  10.07 ms   10.7 ms   10.7 ms
datapack/models - no disk           32.55 ms/iter    (30.94 ms … 37.5 ms)  32.69 ms   37.5 ms   37.5 ms
datapack/blockstates                31.06 ms/iter   (28.16 ms … 44.51 ms)  30.82 ms  44.51 ms  44.51 ms
datapack/models                    110.64 ms/iter (102.68 ms … 129.42 ms) 114.19 ms 129.42 ms 129.42 ms
```

On the following system:

```
Processor    AMD Ryzen 5 3600 6-Core Processor × 6
Memory       16 GiB
```

The `datapack/blockstates` directory contains approximately `800.2 kB` of JSON
files, while the `datapack/models` folder contains around `1.1 MB`.
