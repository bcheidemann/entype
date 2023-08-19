import {
  ArrayType,
  MapType,
  NullType,
  OptionType,
  PrimitiveType,
  StructType,
  Type,
  UnionType,
  UnknownType,
} from "../../types.ts";
import { Context } from "../types.ts";
import { removeNumberSuffix, toPascalCase } from "../util.ts";

export function emitType(
  context: Context,
  name: string,
  type: Type,
  preferInline: boolean,
): string | void {
  switch (type.kind) {
    case "struct":
      return emitStructType(
        context,
        name,
        type,
        preferInline,
      );
    case "union":
      return emitUnionType(
        context,
        name,
        type,
        preferInline,
      );
    case "map":
      return emitMapType(
        context,
        name,
        type,
        preferInline,
      );
    case "option":
      return emitOptionType(
        context,
        name,
        type,
        preferInline,
      );
    case "array":
      return emitArrayType(
        context,
        name,
        type,
        preferInline,
      );
    case "primitive":
      return emitPrimitiveType(
        context,
        name,
        type,
        preferInline,
      );
    case "null":
      return emitNullType(
        context,
        name,
        type,
        preferInline,
      );
    case "unknown":
      return emitUnknownType(
        context,
        name,
        type,
        preferInline,
      );
  }
}

export function emitStructType(
  context: Context,
  name: string,
  type: StructType,
  preferInline: boolean,
) {
  const fields = Array
    .from(type.fields.entries())
    .sort(([key1], [key2]) => key1.localeCompare(key2))
    .map(([key, value]) => {
      const typeName = context.getTypeName(key);
      const inlineType = context.emitType(context, typeName, value, true);
      return `  ${key}: ${inlineType ?? typeName},`;
    });
  context.emit(
    context,
    name,
    type,
    preferInline,
    [
      `pub struct ${name} {`,
      ...fields,
      "}",
      "",
    ].join("\n"),
  );
}

export function emitUnionType(
  context: Context,
  name: string,
  type: UnionType,
  preferInline: boolean,
) {
  const variants = Array
    .from(type.variants.entries())
    .sort(([key1], [key2]) => key1.localeCompare(key2))
    .map(([key, value]) => {
      const typeName = context.getTypeName(key);
      const inlineType = context.emitType(context, typeName, value, true);
      return `  ${toPascalCase(key)}(${inlineType ?? typeName}),`;
    });
  context.emit(
    context,
    name,
    type,
    preferInline,
    [
      `pub enum ${name} {`,
      ...variants,
      "}",
      "",
    ].join("\n"),
  );
}

export function emitMapType(
  context: Context,
  name: string,
  type: MapType,
  preferInline: boolean,
) {
  const typeName = context.getTypeName(`${removeNumberSuffix(name)}Entry`);
  const innerInlineType = context.emitType(
    context,
    typeName,
    type.valueType,
    true,
  );
  const inlineType = `std::collections::HashMap<String, ${
    innerInlineType ?? typeName
  }>`;
  if (preferInline) {
    return inlineType;
  }
  context.emit(
    context,
    name,
    type,
    preferInline,
    [
      `pub type ${name} = ${inlineType};`,
      "",
    ].join("\n"),
  );
}

export function emitOptionType(
  context: Context,
  name: string,
  type: OptionType,
  preferInline: boolean,
) {
  const typeName = context.getTypeName();
  const innerInlineType = context.emitType(
    context,
    typeName,
    type.valueType,
    true,
  );
  const inlineType = `Option<${innerInlineType ?? typeName}>`;
  if (preferInline) {
    return inlineType;
  }
  context.emit(
    context,
    name,
    type,
    preferInline,
    [
      `pub type ${name} = ${inlineType};`,
      "",
    ].join("\n"),
  );
}

export function emitArrayType(
  context: Context,
  name: string,
  type: ArrayType,
  preferInline: boolean,
) {
  const typeName = context.getTypeName(`${removeNumberSuffix(name)}Element`);
  const innerInlineType = context.emitType(
    context,
    typeName,
    type.elementType,
    true,
  );
  const inlineType = `Vec<${innerInlineType ?? typeName}>`;
  if (preferInline) {
    return inlineType;
  }
  context.emit(
    context,
    name,
    type,
    preferInline,
    [
      `pub type ${name} = ${inlineType};`,
      "",
    ].join("\n"),
  );
}

export function emitPrimitiveType(
  context: Context,
  name: string,
  type: PrimitiveType,
  preferInline: boolean,
) {
  const inlineType = getPrimitiveName(type.name);
  if (preferInline) {
    return inlineType;
  }
  context.emit(
    context,
    name,
    type,
    preferInline,
    [
      `pub type ${name} = ${inlineType};`,
      "",
    ].join("\n"),
  );
}

export function emitNullType(
  context: Context,
  name: string,
  type: NullType,
  preferInline: boolean,
) {
  const inlineType = "()";
  if (preferInline) {
    return inlineType;
  }
  context.emit(
    context,
    name,
    type,
    preferInline,
    [
      `pub type ${name} = ${inlineType};`,
      "",
    ].join("\n"),
  );
}

export function emitUnknownType(
  context: Context,
  name: string,
  type: UnknownType,
  preferInline: boolean,
) {
  const inlineType = "Unknown";
  if (preferInline) {
    return inlineType;
  }
  context.emit(
    context,
    name,
    type,
    preferInline,
    [
      `pub type ${name} = ${inlineType};`,
      "",
    ].join("\n"),
  );
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
