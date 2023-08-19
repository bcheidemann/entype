import { Type } from "../types.ts";

export type Lang = "rust" | "typescript";
export type EmitRawFn = (data: string) => void;
export type EmitFn = (
  context: Context,
  name: string,
  type: Type,
  preferInline: boolean,
  code: string,
) => void;
export type EmitAnnotationFn = (annotation: string) => void;
export type GetTypeNameFn = (name?: string) => string;
export type EmitTypeFn = (
  context: Context,
  name: string,
  type: Type,
  preferInline: boolean,
) => string | void;
export type Context = {
  lang: Lang;
  emit: EmitFn;
  emitAnnotation: EmitAnnotationFn;
  emitType: EmitTypeFn;
  getTypeName: GetTypeNameFn;
};
export type EmitterModule = {
  emitType: EmitTypeFn;
};
