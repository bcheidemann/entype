import { Context } from "../emit/types.ts";
import { Type } from "../types.ts";

export type PluginName = string;

export type PreEmitHook = (
  context: Context,
  name: string,
  type: Type,
  preferInline: boolean,
  code: string,
) => string | void;

export type Plugin = {
  hooks: {
    preEmitHook?: PreEmitHook;
  };
};
