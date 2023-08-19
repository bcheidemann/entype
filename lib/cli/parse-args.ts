import { ParseLangArgsContext } from "./parse-args-context.ts";
import { Config } from "./types.ts";

export function parseArgs(args: string[]): Config {
  if (args.length === 0) {
    return {
      help: true,
      invalidArgs: true,
    };
  }

  const context = new ParseLangArgsContext(args);

  return parseLangArgs(context);
}

export function parseLangArgs(context: ParseLangArgsContext): Config {
  while (!context.atEnd()) {
    const arg = context.advance();
    switch (arg) {
      case "--allow-unstable":
        return parseAllowUnstableArg(context);
      case "--lang":
      case "-l":
        return parseLangArg(context);
      case "--plugin":
      case "-p":
        return parsePluginArg(context);
      case "--help":
      case "-h":
        return parseHelpArg(context);
      case "--version":
      case "-v":
        return parseVersionArg(context);
      default:
        return parseFileArg(context, arg);
    }
  }

  return context.getConfig();
}

export function parseAllowUnstableArg(
  context: ParseLangArgsContext,
): Config {
  context.setAllowUnstable();
  return parseLangArgs(context);
}

export function parseLangArg(
  context: ParseLangArgsContext,
): Config {
  if (context.atEnd()) {
    return {
      help: true,
      invalidArgs: true,
      message: `Missing argument for --lang`,
    };
  }

  const lang = context.advance();

  switch (lang) {
    case "rust":
    case "typescript":
      context.setLang(lang);
      return parseLangArgs(context);
    default:
      return {
        help: true,
        invalidArgs: true,
        message:
          `Unknown language specified at position ${context.previousPosition}: ${lang}`,
      };
  }
}

export function parsePluginArg(
  context: ParseLangArgsContext,
): Config {
  if (context.atEnd()) {
    return {
      help: true,
      invalidArgs: true,
      message: `Missing argument for --lang`,
    };
  }

  const pluginName = context.advance();
  context.addPlugin(pluginName);

  return parseLangArgs(context);
}

export function parseHelpArg(
  _context: ParseLangArgsContext,
): Config {
  return {
    help: true,
    invalidArgs: false,
  };
}

export function parseVersionArg(
  _context: ParseLangArgsContext,
): Config {
  return {
    version: true,
  };
}

export function parseFileArg(
  context: ParseLangArgsContext,
  arg: string,
): Config {
  context.addFile(arg);
  return parseLangArgs(context);
}
