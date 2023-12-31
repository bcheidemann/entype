import { Lang } from "../emit/types.ts";
import { PluginName } from "../plugins/types.ts";
import { Config } from "./types.ts";

export abstract class ParseArgsContext {
  private args: string[];
  private idx: number;

  constructor(args: string[]) {
    this.args = args;
    this.idx = 0;
  }

  public get previousPosition(): number {
    return this.idx - 1;
  }

  public get position(): number {
    return this.idx;
  }

  public peek(): string {
    if (this.atEnd()) {
      throw new Error("Unexpected end of arguments");
    }
    return this.args[this.idx];
  }

  public advance(): string {
    if (this.atEnd()) {
      throw new Error("Unexpected end of arguments");
    }
    return this.args[this.idx++];
  }

  public atEnd(): boolean {
    return this.idx >= this.args.length;
  }

  public abstract getConfig(): Config;
}

export class ParseLangArgsContext extends ParseArgsContext {
  private allowUnstable = false;
  private lang: Lang | null = null;
  private plugins: PluginName[] = [];
  private files: string[] = [];

  public getConfig(): Config {
    if (
      !this.allowUnstable &&
      this.plugins.length > 0
    ) {
      return {
        help: true,
        invalidArgs: true,
        message:
          "Plugins are unstable and may change in future versions. Use --allow-unstable to enable them.",
      };
    }
    if (this.lang === null) {
      return {
        help: true,
        invalidArgs: true,
        message: "No language specified (use --lang or -l)",
      };
    }
    return {
      lang: this.lang,
      plugins: this.plugins,
      files: this.files,
    };
  }

  public setAllowUnstable() {
    this.allowUnstable = true;
  }

  public addFile(file: string) {
    this.files.push(file);
  }

  public addPlugin(pluginName: PluginName) {
    this.plugins.push(pluginName);
  }

  public setLang(lang: Lang) {
    this.lang = lang;
  }
}
