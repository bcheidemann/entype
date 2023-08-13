import { Lang } from "../emit/types.ts";

export type HelpConfig = {
  help: true;
  invalidArgs: boolean;
  message?: string;
};

export type VersionConfig = {
  version: true;
};

export type LangConfig = {
  lang: Lang;
  files: string[];
};

export type Config =
  | HelpConfig
  | VersionConfig
  | LangConfig;
