import { GetTypeNameFn } from "./types.ts";

export function toPascalCase(str: string) {
  return str[0].toUpperCase() + str.slice(1);
}

export function removeNumberSuffix(str: string) {
  return str.replace(/[0-9]+$/, "");
}

export function createGetTypeName(): GetTypeNameFn {
  let counter = 0;
  return function getTypeName(name?: string) {
    const namePrefix = name ? removeNumberSuffix(toPascalCase(name)) : "T";
    return `${namePrefix}${counter++}`;
  };
}

export function indentRange(
  str: string,
  from: number,
  to: number,
  depth = 1,
) {
  const indent = "  ".repeat(depth);
  return str
    .split("\n")
    .map((line, idx) => {
      if (idx < from || idx >= to) {
        return line;
      }
      if (line.length === 0) {
        return "";
      }
      return `${indent}${line}`;
    })
    .join("\n");
}
