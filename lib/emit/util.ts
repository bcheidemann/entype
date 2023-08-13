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
