export function isIdentifier(str: string) {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(str);
}

export function toPascalCase(str: string) {
  return str[0].toUpperCase() + str.slice(1);
}

export function removeNumberSuffix(str: string) {
  return str.replace(/[0-9]+$/, "");
}
