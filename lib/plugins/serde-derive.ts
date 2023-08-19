import { Context } from "../emit/types.ts";
import { Type } from "../types.ts";
import { Plugin } from "./types.ts";

export const plugin: Plugin = {
  hooks: {
    preEmitHook(
      context,
      name,
      type,
      preferInline,
      code,
    ) {
      if (context.lang !== "rust") {
        return code;
      }
      switch (type.kind) {
        case "struct":
          return preEmitStructType(
            context,
            name,
            type,
            preferInline,
            code,
          );
        case "union":
          return preEmitUnionType(
            context,
            name,
            type,
            preferInline,
            code,
          );
        case "map":
        case "option":
        case "array":
        case "primitive":
        case "null":
        case "unknown":
          return code;
      }
    },
  },
};

export function preEmitStructType(
  context: Context,
  _name: string,
  _type: Type,
  _preferInline: boolean,
  code: string,
) {
  context.emitAnnotation("#[derive(serde::Serialize, serde::Deserialize)]");
  return code;
}

export function preEmitUnionType(
  context: Context,
  _name: string,
  _type: Type,
  _preferInline: boolean,
  code: string,
) {
  context.emitAnnotation("#[derive(serde::Serialize, serde::Deserialize)]");
  context.emitAnnotation("#[serde(untagged)]");
  return code;
}
