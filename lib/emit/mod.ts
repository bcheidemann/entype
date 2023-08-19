import { Plugin } from "../plugins/types.ts";
import { Type } from "../types.ts";
import {
  Context,
  EmitRawFn,
  EmitterModule,
  EmitTypeFn,
  GetTypeNameFn,
  Lang,
} from "./types.ts";
import { createGetTypeName } from "./util.ts";

export function createContext(
  lang: Lang,
  plugins: Plugin[],
  emit: EmitRawFn,
  emitType: EmitTypeFn,
  getTypeName: GetTypeNameFn,
): Context {
  return {
    lang,
    emit(
      context: Context,
      name: string,
      type: Type,
      preferInline: boolean,
      code: string,
    ) {
      const wrappedEmit = plugins.reduce(
        (emit, plugin) => {
          if (!plugin.hooks.preEmitHook) {
            return emit;
          }
          return (context, name, type, preferInline, code) => {
            const processedCode = plugin.hooks.preEmitHook!(
              context,
              name,
              type,
              preferInline,
              code,
            );
            if (processedCode) {
              emit(context, name, type, preferInline, processedCode);
            }
          };
        },
        (
          _context: Context,
          _name: string,
          _type: Type,
          _preferInline: boolean,
          code: string,
        ) => {
          emit(code);
        },
      );

      return wrappedEmit(context, name, type, preferInline, code);
    },
    emitAnnotation(annotation: string) {
      emit(annotation);
    },
    emitType,
    getTypeName,
  };
}

export async function emitType(
  lang: Lang,
  name: string,
  type: Type,
  plugins: Plugin[],
  emit: EmitRawFn,
  getTypeName: GetTypeNameFn,
) {
  const { emitType } = await loadEmitterModule(lang);
  const context = createContext(lang, plugins, emit, emitType, getTypeName);
  emitType(context, name, type, false);
}

export async function emitRootType(
  lang: Lang,
  type: Type,
  plugins: Plugin[],
  emit: EmitRawFn,
  getTypeName: GetTypeNameFn = createGetTypeName(),
) {
  await emitType(lang, "Root", type, plugins, emit, getTypeName);
}

export async function emitTypeToString(
  lang: Lang,
  name: string,
  type: Type,
  plugins: Plugin[],
  getTypeName: GetTypeNameFn = createGetTypeName(),
): Promise<string> {
  let code = "";
  function emit(data: string) {
    code += `${data}\n`;
  }
  await emitType(lang, name, type, plugins, emit, getTypeName);
  return code;
}

export async function emitRootTypeToString(
  lang: Lang,
  type: Type,
  plugins: Plugin[],
  getTypeName: GetTypeNameFn = createGetTypeName(),
): Promise<string> {
  return await emitTypeToString(
    lang,
    "Root",
    type,
    plugins,
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
