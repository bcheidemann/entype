import {
  isHomogeneousTypeArray,
  isMapType,
  isNullType,
} from "./type-guards.ts";
import {
  ArrayType,
  HomogeneousTypeArray,
  MapType,
  NullType,
  OptionType,
  PrimitiveType,
  StructType,
  Type,
  UnionType,
  UnknownType,
} from "./types.ts";

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
    case "union":
      return collapseUnionTypes(types as UnionType[]);
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
    types.map((type) => type.kind),
  );

  if (uniqueTypes.has("option")) {
    const innerTypes = types
      .map((type) => {
        switch (type.kind) {
          case "option":
            return type.valueType;
          default:
            return type;
        }
      })
      .filter((type) => !isNullType(type));
    const collapsedType = collapseTypes(innerTypes);
    return { kind: "option", valueType: collapsedType };
  }

  if (uniqueTypes.has("union")) {
    return collapseNonHomogeneousTypes(
      types.flatMap((type) => {
        switch (type.kind) {
          case "union":
            return Array.from(type.variants.values());
          default:
            return type;
        }
      }),
    );
  }

  // Coerce nulls to option types
  if (uniqueTypes.has("null")) {
    const nonNullTypes = types.filter((type) => !isNullType(type));
    const collapsedType = collapseTypes(nonNullTypes);
    return { kind: "option", valueType: collapsedType };
  }

  // Coerce structs to maps so that we can collapse them together.
  if (uniqueTypes.has("map") && uniqueTypes.has("struct")) {
    return collapseTypes(
      types.map((type) => {
        switch (type.kind) {
          case "struct":
            return {
              kind: "map",
              valueType: collapseTypes(Array.from(type.fields.values())),
            };
          default:
            return type;
        }
      }),
    );
  }

  // Collapse maps
  if (uniqueTypes.has("map")) {
    const mapTypes = types.filter(isMapType);
    const collapsedMapType = collapseMapTypes(mapTypes);
    const nonMapTypes = types.filter((type) => !isMapType(type));
    return collapseTypes([...nonMapTypes, collapsedMapType]);
  }

  const collectedVariants: {
    struct: StructType[];
    union: UnionType[];
    map: MapType[];
    option: OptionType[];
    array: ArrayType[];
    primitive: PrimitiveType[];
    null: NullType[];
    unknown: UnknownType[];
  } = {
    struct: [],
    union: [],
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
      case "union":
        collectedVariants.union.push(type);
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
      .map((
        [variant, types],
      ) => [variant as Type["kind"], collapseHomogeneousTypes(types)]),
  );
  return { kind: "union", variants };
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
      types.map((type) => type.fields.get(key) ?? { kind: "null" }),
    );
    fields.set(key, fieldType);
  }
  return { kind: "struct", fields };
}

export function collapseUnionTypes(types: UnionType[]): UnionType {
  const variantNames = new Set<Type["kind"] | PrimitiveType["name"]>();
  for (const type of types) {
    for (const variantName of type.variants.keys()) {
      variantNames.add(variantName);
    }
  }
  const variants = new Map<Type["kind"] | PrimitiveType["name"], Type>();
  for (const variantName of variantNames) {
    const variantType = collapseTypes(
      types
        .map((type) => type.variants.get(variantName))
        .filter(Boolean),
    );
    variants.set(variantName, variantType);
  }
  return { kind: "union", variants };
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

export function collapsePrimitiveTypes(
  types: PrimitiveType[],
): PrimitiveType | UnionType {
  const uniqueVariants = new Set<PrimitiveType["name"]>();
  for (const type of types) {
    uniqueVariants.add(type.name);
  }
  if (uniqueVariants.size === 1) {
    return { kind: "primitive", name: uniqueVariants.values().next().value };
  }
  const variants = new Map(
    Array
      .from(uniqueVariants.values())
      .map((variant) =>
        [variant, { kind: "primitive", name: variant }] as const
      ),
  );
  return { kind: "union", variants };
}

export function collapseNullTypes(_types: NullType[]): NullType {
  return { kind: "null" };
}

export function collapseUnknownTypes(_types: UnknownType[]): UnknownType {
  return { kind: "unknown" };
}
