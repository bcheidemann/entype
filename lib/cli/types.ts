import { Lang } from "../emit/types.ts";

export type HelpConfig = {
  help: true;
  invalidArgs: boolean;
  message?: string;
};

export type LangConfig = {
  lang: Lang;
  files: string[];
};

export type Config =
  | HelpConfig
  | LangConfig;
