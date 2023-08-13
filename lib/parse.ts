import { collapseTypes } from "./collapse-types.ts";
import { Json, JsonArray, JsonObject, Type } from "./types.ts";
import { isIdentifier } from "./util.ts";

export function parseJson(obj: Json): Type {
  switch (typeof obj) {
    case "object":
      if (obj === null) {
        return parseNull(obj);
      }
      if (Array.isArray(obj)) {
        return parseJsonArray(obj);
      }
      return parseJsonObject(obj);
    case "string":
      return { kind: "primitive", name: "string" };
    case "number":
      return { kind: "primitive", name: "number" };
    case "boolean":
      return { kind: "primitive", name: "boolean" };
    default:
      throw new Error("Object is not valid JSON");
  }
}

export function parseNull(_obj: null): Type {
  return { kind: "null" };
}

export function parseJsonArray(obj: JsonArray): Type {
  const elementTypes = obj.map(parseJson);
  const elementType = collapseTypes(elementTypes);
  return { kind: "array", elementType };
}

export function parseJsonObject(obj: JsonObject): Type {
  const fields = new Map(
    Object
      .entries(obj)
      .map(([key, value]) => [key, parseJson(value)])
  );
  const isMap = !Array
    .from(fields.keys())
    .every(isIdentifier);
  if (isMap) {
    const valueTypes = Array.from(fields.values());
    const valueType = collapseTypes(valueTypes);
    return { kind: "map", valueType };
  }
  return { kind: "struct", fields };
}
