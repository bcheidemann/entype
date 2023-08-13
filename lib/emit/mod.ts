import { Type } from "../types.ts";
import { EmitFn, EmitterModule, GetTypeNameFn, Lang } from "./types.ts";
import { createGetTypeName } from "./util.ts";

export async function emitType(
  lang: Lang,
  name: string,
  type: Type,
  emit: EmitFn,
  getTypeName: GetTypeNameFn,
) {
  const { emitType } = await loadEmitterModule(lang);
  emitType(name, type, getTypeName, emit, false);
}

export async function emitRootType(
  lang: Lang,
  type: Type,
  emit: EmitFn,
  getTypeName: GetTypeNameFn = createGetTypeName(),
) {
  await emitType(lang, "Root", type, emit, getTypeName);
}

export async function emitTypeToString(
  lang: Lang,
  name: string,
  type: Type,
  getTypeName: GetTypeNameFn = createGetTypeName(),
): Promise<string> {
  let code = "";
  function emit(data: string) {
    code += data;
  }
  await emitType(lang, name, type, emit, getTypeName);
  return code;
}

export async function emitRootTypeToString(
  lang: Lang,
  type: Type,
  getTypeName: GetTypeNameFn = createGetTypeName(),
): Promise<string> {
  return await emitTypeToString(
    lang,
    "Root",
    type,
    getTypeName,
  );
}

async function loadEmitterModule(lang: Lang): Promise<EmitterModule> {
  switch (lang) {
    case "rust":
      return await import("./langs/rust.ts");
    case "typescript":
      return await import("./langs/typescript.ts");
    default:
      throw new Error(`Unsupported language: ${lang}`);
  }
}
