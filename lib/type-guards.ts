import { ArrayType, UnionType, HomogeneousTypeArray, MapType, NullType, OptionType, PrimitiveType, StructType, Type, UnknownType } from "./types.ts";

export function isStructType(type: Type): type is StructType {
  return type.kind === "struct";
}

export function isUnionType(type: Type): type is UnionType {
  return type.kind === "union";
}

export function isMapType(type: Type): type is MapType {
  return type.kind === "map";
}

export function isOptionType(type: Type): type is OptionType {
  return type.kind === "option";
}

export function isArrayType(type: Type): type is ArrayType {
  return type.kind === "array";
}

export function isPrimitiveType(type: Type): type is PrimitiveType {
  return type.kind === "primitive";
}

export function isNullType(type: Type): type is NullType {
  return type.kind === "null";
}

export function isUnknownType(type: Type): type is UnknownType {
  return type.kind === "unknown";
}

export function isHomogeneousTypeArray(types: Type[]): types is HomogeneousTypeArray {
  return types.every((type) => type.kind === types[0].kind);
}
