import { Type } from "../types.ts";

export type Lang = "rust";
export type EmitFn = (data: string) => void;
export type GetTypeNameFn = (name?: string) => string;
export type EmitterModule = {
  emitType: (
    name: string,
    type: Type,
    getTypeName: GetTypeNameFn,
    emit: EmitFn,
    preferInline: boolean,
  ) => string | void;
};
