import "npm:@total-typescript/ts-reset";
import { ArrayType, EnumType, HomogeneousTypeArray, Json, JsonArray, JsonObject, MapType, NullType, OptionType, PrimitiveType, StructType, Type, UnknownType } from "./types.ts";

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
  // TODO: Handle map types (i.e. when keys are not valid identifiers)
  return { kind: "struct", fields };
}

export function isHomogeneousTypeArray(types: Type[]): types is HomogeneousTypeArray {
  return types.every((type) => type.kind === types[0].kind);
}

export function collapseTypes(types: Type[]): Type {
  if (types.length === 0) {
    return { kind: "unknown" };
  }
  return isHomogeneousTypeArray(types)
    ? collapseHomogeneousTypes(types)
    : collapseNonHomogeneousTypes(types);
}

export function collapseHomogeneousTypes(types: HomogeneousTypeArray): Type {
  if (types.length === 0) {
    return { kind: "unknown" };
  }
  switch (types[0].kind) {
    case "struct":
      return collapseStructTypes(types as StructType[]);
    case "enum":
      return collapseEnumTypes(types as EnumType[]);
    case "map":
      return collapseMapTypes(types as MapType[]);
    case "option":
      return collapseOptionTypes(types as OptionType[]);
    case "array":
      return collapseArrayTypes(types as ArrayType[]);
    case "primitive":
      return collapsePrimitiveTypes(types as PrimitiveType[]);
    case "null":
      return collapseNullTypes(types as NullType[]);
    case "unknown":
      return collapseUnknownTypes(types as UnknownType[]);
  }
}

export function collapseNonHomogeneousTypes(types: Type[]): Type {
  const uniqueTypes = new Set<Type["kind"]>(
    types.map((type) => type.kind)
  );

  if (uniqueTypes.has("enum")) {
    return collapseNonHomogeneousTypes(
      types.flatMap((type) => {
        switch (type.kind) {
          case "enum":
            return Array.from(type.variants.values());
          default:
            return type;
        }
      })
    );
  }

  if (uniqueTypes.has("null")) {
    const nonNullTypes = types.filter((type) => type.kind !== "null");
    const collapsedType = collapseTypes(nonNullTypes);
    return { kind: "option", valueType: collapsedType };
  }

  const collectedVariants: {
    struct: StructType[];
    enum: EnumType[];
    map: MapType[];
    option: OptionType[];
    array: ArrayType[];
    primitive: PrimitiveType[];
    null: NullType[];
    unknown: UnknownType[];
  } = {
    struct: [],
    enum: [],
    map: [],
    option: [],
    array: [],
    primitive: [],
    null: [],
    unknown: [],
  };
  for (const type of types) {
    switch (type.kind) {
      case "struct":
        collectedVariants.struct.push(type);
        break;
      case "enum":
        collectedVariants.enum.push(type);
        break;
      case "map":
        collectedVariants.map.push(type);
        break;
      case "option":
        collectedVariants.option.push(type);
        break;
      case "array":
        collectedVariants.array.push(type);
        break;
      case "primitive":
        collectedVariants.primitive.push(type);
        break;
      case "null":
        collectedVariants.null.push(type);
        break;
      case "unknown":
        collectedVariants.unknown.push(type);
        break;
    }
  }
  const variants = new Map(
    Object.entries(collectedVariants)
      .filter(([_variant, types]) => types.length > 0)
      .map(([variant, types]) => [variant, collapseHomogeneousTypes(types)])
  );
  return { kind: "enum", variants };
}

export function collapseStructTypes(types: StructType[]): StructType {
  const keys = new Set<string>();
  for (const type of types) {
    for (const key of type.fields.keys()) {
      keys.add(key);
    }
  }
  const fields = new Map<string, Type>();
  for (const key of keys) {
    const fieldType = collapseTypes(
      types.map((type) => type.fields.get(key) ?? { kind: "null" })
    );
    fields.set(key, fieldType);
  }
  return { kind: "struct", fields };
}

export function collapseEnumTypes(types: EnumType[]): EnumType {
  const variantNames = new Set<string>();
  for (const type of types) {
    for (const variantName of type.variants.keys()) {
      variantNames.add(variantName);
    }
  }
  const variants = new Map<string, Type>();
  for (const variantName of variantNames) {
    const variantType = collapseTypes(
      types
        .map((type) => type.variants.get(variantName))
        .filter(Boolean)
    );
    variants.set(variantName, variantType);
  }
  return { kind: "enum", variants };
}

export function collapseMapTypes(types: MapType[]): MapType {
  const valueTypes = types.map((type) => type.valueType);
  const valueType = collapseTypes(valueTypes);
  return { kind: "map", valueType };
}

export function collapseOptionTypes(types: OptionType[]): OptionType {
  const valueTypes = types.map((type) => type.valueType);
  const valueType = collapseTypes(valueTypes);
  return { kind: "option", valueType };
}

export function collapseArrayTypes(types: ArrayType[]): ArrayType {
  const elementTypes = types.map((type) => type.elementType);
  const elementType = collapseTypes(elementTypes);
  return { kind: "array", elementType };
}

export function collapsePrimitiveTypes(types: PrimitiveType[]): PrimitiveType | EnumType {
  const names = new Set<PrimitiveType["name"]>();
  for (const type of types) {
    names.add(type.name);
  }
  if (names.size === 1) {
    return { kind: "primitive", name: names.values().next().value };
  }
  const variants = new Map(
    Array
      .from(names.values())
      .map((name) => [name, { kind: "primitive", name }] as const)
  );
  return { kind: "enum", variants };
}

export function collapseNullTypes(_types: NullType[]): NullType {
  return { kind: "null" };
}

export function collapseUnknownTypes(_types: UnknownType[]): UnknownType {
  return { kind: "unknown" };
}

if (import.meta.main) {
  console.log('Ok');
}
