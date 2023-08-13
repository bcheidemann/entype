export type Json =
  | string
  | number
  | boolean
  | null
  | JsonArray
  | JsonObject;
export type JsonArray = Json[];
export type JsonObject = { [key: string]: Json };

export type Type =
  | StructType
  | UnionType
  | MapType
  | OptionType
  | ArrayType
  | PrimitiveType
  | NullType
  | UnknownType;
export type StructType = {
  kind: "struct";
  fields: Map<string, Type>;
};
export type UnionType = {
  kind: "union";
  variants: Map<Type["kind"] | PrimitiveType["name"], Type>;
};
export type MapType = {
  kind: "map";
  valueType: Type;
};
export type OptionType = {
  kind: "option";
  valueType: Type;
};
export type ArrayType = {
  kind: "array";
  elementType: Type;
};
export type PrimitiveType = {
  kind: "primitive";
  name: "string" | "number" | "boolean";
};
export type NullType = {
  kind: "null";
};
export type UnknownType = {
  kind: "unknown";
};
export type HomogeneousTypeArray =
  | StructType[]
  | UnionType[]
  | MapType[]
  | OptionType[]
  | ArrayType[]
  | PrimitiveType[]
  | NullType[]
  | UnknownType[];
