import {
  ArrayType,
  EmitFn,
  GetTypeNameFn,
  MapType,
  NullType,
  OptionType,
  PrimitiveType,
  StructType,
  Type,
  UnionType,
  UnknownType,
} from "../types.ts";
import { removeNumberSuffix, toPascalCase } from "../util.ts";

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
    case "union":
      return emitUnionType(
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
      const typeName = getTypeName(key);
      const inlineType = emitType(typeName, value, getTypeName, emit, true);
      return `  ${key}: ${inlineType ?? typeName},`;
    });
  emit(
    [
      `pub struct ${name} {`,
      ...fields,
      "}",
      "",
    ].join("\n"),
  );
}

export function emitUnionType(
  name: string,
  type: UnionType,
  getTypeName: GetTypeNameFn,
  emit: EmitFn,
  _preferInline: boolean,
) {
  const variants = Array
    .from(type.variants.entries())
    .sort(([key1], [key2]) => key1.localeCompare(key2))
    .map(([key, value]) => {
      const typeName = getTypeName(key);
      const inlineType = emitType(typeName, value, getTypeName, emit, true);
      return `  ${toPascalCase(key)}(${inlineType ?? typeName}),`;
    });
  emit(
    [
      `pub enum ${name} {`,
      ...variants,
      "}",
      "",
    ].join("\n"),
  );
}

export function emitMapType(
  name: string,
  type: MapType,
  getTypeName: GetTypeNameFn,
  emit: EmitFn,
  preferInline: boolean,
) {
  const typeName = getTypeName(`${removeNumberSuffix(name)}Entry`);
  const innerInlineType = emitType(
    typeName,
    type.valueType,
    getTypeName,
    emit,
    true,
  );
  const inlineType = `std::collections::HashMap<String, ${
    innerInlineType ?? typeName
  }>`;
  if (preferInline) {
    return inlineType;
  }
  emit(
    [
      `pub type ${name} = ${inlineType};`,
      "",
    ].join("\n"),
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
  const innerInlineType = emitType(
    typeName,
    type.valueType,
    getTypeName,
    emit,
    true,
  );
  const inlineType = `Option<${innerInlineType ?? typeName}>`;
  if (preferInline) {
    return inlineType;
  }
  emit(
    [
      `pub type ${name} = ${inlineType};`,
      "",
    ].join("\n"),
  );
}

export function emitArrayType(
  name: string,
  type: ArrayType,
  getTypeName: GetTypeNameFn,
  emit: EmitFn,
  preferInline: boolean,
) {
  const typeName = getTypeName(`${removeNumberSuffix(name)}Element`);
  const innerInlineType = emitType(
    typeName,
    type.elementType,
    getTypeName,
    emit,
    true,
  );
  const inlineType = `Vec<${innerInlineType ?? typeName}>`;
  if (preferInline) {
    return inlineType;
  }
  emit(
    [
      `pub type ${name} = ${inlineType};`,
      "",
    ].join("\n"),
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
    ].join("\n"),
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
    ].join("\n"),
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
    ].join("\n"),
  );
}

export function emitTypes(
  type: Type,
  emitFn?: EmitFn,
  getTypeNameFn?: GetTypeNameFn,
) {
  let code = "";
  const emit = (data: string) => {
    emitFn?.(data);
    code += data;
  };
  let counter = 0;
  const getTypeName = getTypeNameFn ?? ((name?: string) => {
    const namePrefix = name ? removeNumberSuffix(toPascalCase(name)) : "T";
    return `${namePrefix}${counter++}`;
  });
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
