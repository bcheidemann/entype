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

type EmitFn = (data: string) => void;
type GetTypeNameFn = () => string;

export function emitType(
  name: string,
  type: Type,
  getTypeName: GetTypeNameFn,
  emit: EmitFn,
  preferInline: boolean,
): string | void {
  switch (type.kind) {
    case "struct":
      return emitStructType(
        name,
        type,
        getTypeName,
        emit,
        preferInline,
      );
    case "enum":
      return emitEnumType(
        name,
        type,
        getTypeName,
        emit,
        preferInline,
      );
    case "map":
      return emitMapType(
        name,
        type,
        getTypeName,
        emit,
        preferInline,
      );
    case "option":
      return emitOptionType(
        name,
        type,
        getTypeName,
        emit,
        preferInline,
      );
    case "array":
      return emitArrayType(
        name,
        type,
        getTypeName,
        emit,
        preferInline,
      );
    case "primitive":
      return emitPrimitiveType(
        name,
        type,
        getTypeName,
        emit,
        preferInline,
      );
    case "null":
      return emitNullType(
        name,
        type,
        getTypeName,
        emit,
        preferInline,
      );
    case "unknown":
      return emitUnknownType(
        name,
        type,
        getTypeName,
        emit,
        preferInline,
      );
  }
}

export function emitStructType(
  name: string,
  type: StructType,
  getTypeName: GetTypeNameFn,
  emit: EmitFn,
  _preferInline: boolean,
) {
  const fields = Array
    .from(type.fields.entries())
    .sort(([key1], [key2]) => key1.localeCompare(key2))
    .map(([key, value]) => {
      const typeName = getTypeName();
      const inlineType = emitType(typeName, value, getTypeName, emit, true);
      return `  ${key}: ${inlineType ?? typeName},`;
    });
  emit(
    [
      `pub struct ${name} {`,
      ...fields,
      "}",
      "",
    ].join("\n")
  );
}

export function emitEnumType(
  name: string,
  type: EnumType,
  getTypeName: GetTypeNameFn,
  emit: EmitFn,
  _preferInline: boolean,
) {
  const variants = Array
    .from(type.variants.entries())
    .sort(([key1], [key2]) => key1.localeCompare(key2))
    .map(([key, value]) => {
      const typeName = getTypeName();
      const inlineType = emitType(typeName, value, getTypeName, emit, true);
      return `  ${key}(${inlineType ?? typeName}),`;
    });
  emit(
    [
      `pub enum ${name} {`,
      ...variants,
      "}",
      "",
    ].join("\n")
  );
}

export function emitMapType(
  name: string,
  type: MapType,
  getTypeName: GetTypeNameFn,
  emit: EmitFn,
  preferInline: boolean,
) {
  const typeName = getTypeName();
  const innerInlineType = emitType(typeName, type.valueType, getTypeName, emit, true);
  const inlineType = `std::collections::HashMap<String, ${innerInlineType ?? typeName}>`;
  if (preferInline) {
    return inlineType;
  }
  emit(
    [
      `pub type ${name} = ${inlineType};`,
      "",
    ].join("\n")
  );
}

export function emitOptionType(
  name: string,
  type: OptionType,
  getTypeName: GetTypeNameFn,
  emit: EmitFn,
  preferInline: boolean,
) {
  const typeName = getTypeName();
  const innerInlineType = emitType(typeName, type.valueType, getTypeName, emit, true);
  const inlineType = `Option<${innerInlineType ?? typeName}>`;
  if (preferInline) {
    return inlineType;
  }
  emit(
    [
      `pub type ${name} = ${inlineType};`,
      "",
    ].join("\n")
  );
}

export function emitArrayType(
  name: string,
  type: ArrayType,
  getTypeName: GetTypeNameFn,
  emit: EmitFn,
  preferInline: boolean,
) {
  const typeName = getTypeName();
  const innerInlineType = emitType(typeName, type.elementType, getTypeName, emit, true);
  const inlineType = `Vec<${innerInlineType ?? typeName}>`;
  if (preferInline) {
    return inlineType;
  }
  emit(
    [
      `pub type ${name} = ${inlineType};`,
      "",
    ].join("\n")
  );
}

export function emitPrimitiveType(
  name: string,
  type: PrimitiveType,
  _getTypeName: GetTypeNameFn,
  emit: EmitFn,
  preferInline: boolean,
) {
  const inlineType = getPrimitiveName(type.name);
  if (preferInline) {
    return inlineType;
  }
  emit(
    [
      `pub type ${name} = ${inlineType};`,
      "",
    ].join("\n")
  );
}

export function emitNullType(
  name: string,
  _type: NullType,
  _getTypeName: GetTypeNameFn,
  emit: EmitFn,
  preferInline: boolean,
) {
  const inlineType = "()";
  if (preferInline) {
    return inlineType;
  }
  emit(
    [
      `pub type ${name} = ${inlineType};`,
      "",
    ].join("\n")
  );
}

export function emitUnknownType(
  name: string,
  _type: UnknownType,
  _getTypeName: GetTypeNameFn,
  emit: EmitFn,
  preferInline: boolean,
) {
  const inlineType = "Unknown";
  if (preferInline) {
    return inlineType;
  }
  emit(
    [
      `pub type ${name} = ${inlineType};`,
      "",
    ].join("\n")
  );
}

export function emitTypes(type: Type) {
  let code = "";
  const emit = (data: string) => {
    code += data;
  }
  let counter = 0;
  const getTypeName = () => {
    return `T${counter++}`;
  };
  emitType("Root", type, getTypeName, emit, false);
  return code;
}

export function getPrimitiveName(primitive: PrimitiveType["name"]) {
  switch (primitive) {
    case "string":
      return "String";
    case "number":
      return "f64";
    case "boolean":
      return "bool";
  }
}

if (import.meta.main) {
  console.log('Ok');
}
