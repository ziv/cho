import type { LinkedApp, LinkedCommand } from "./linker.ts";
import { Linker } from "./linker.ts";
import type { Ctr } from "../core/meta/mod.ts";
import { CompiledModule, Compiler } from "../core/compiler/compiler.ts";
import { parseArgs } from "@std/cli/parse-args";
import { ChoCommandContext } from "./context.ts";

export class Application {
  static async create(ctr: Ctr) {
    const compiled = await new Compiler().compile(ctr);
    const linked = new Linker().link(compiled);

    return new Application(
      compiled,
      linked,
    );
  }

  constructor(
    readonly instance: CompiledModule,
    readonly appRef: LinkedApp,
  ) {
  }

  run(argv: string[]) {
    const args = parseArgs(argv);
    const showHelp = args.help ?? args.h ?? false;

    console.log(this.appRef);
    // if there is a main command, always run it (main and sub does not mix)
    if (this.appRef.main) {
      return showHelp
        ? this.showHelp(this.appRef.main)
        : this.appRef(this.appRef.main, args);
    }

    // route to subcommand if exists
    const route = args._[0] as string;
    const subArgs = {
      ...args,
      _: args._.slice(1), // remove the route from args
    };

    if (!route || !this.appRef.commands[route]) {
      throw new Error("No command specified/found... show help?");
    }

    return showHelp
      ? this.showHelp(this.appRef.commands[route])
      : this.apply(this.appRef.commands[route], subArgs);
  }

  async apply(cmd: LinkedCommand, args: any) {
    const ctx = new ChoCommandContext(args);

    for (const m of cmd.middlewares) {
      const { resolve, promise } = Promise.withResolvers();
      // call the middleware
      m(ctx, resolve);
      // wait for the "next" to be called
      await promise;
    }

    try {
      await cmd.handle(ctx);
    } catch (err) {
      if (cmd.errorHandler) {
        await cmd.errorHandler(err, ctx);
      } else {
        throw err;
      }
    }
  }

  showHelp(cmd: LinkedCommand) {
    console.log(cmd.compiled.meta?.help ?? "No help available.");
  }
}
