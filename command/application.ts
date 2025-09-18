import type { Ctr } from "@chojs/core/meta";
import { parseArgs } from "@std/cli/parse-args";
import type { LinkedApp, LinkedCommand } from "./linker.ts";
import { Linker } from "./linker.ts";
import {
  type CompiledModule,
  Compiler,
  graphBuilder,
  onModuleActivate,
  onModuleInit,
  onModuleShutdown,
} from "@chojs/core/application";
import { type ChoArgs, ChoCommandContext } from "./context.ts";

export class MissingCommandError extends Error {}
export class NotFoundError extends Error {}
export class MissingHelpError extends Error {}

export class Application {
  /**
   * Create an application instance from a root controller.
   *
   * @param ctr
   */
  static async create(ctr: Ctr): Promise<Application> {
    const compiled = await new Compiler().compile(graphBuilder(ctr));
    await onModuleInit(compiled);

    const linked = new Linker().link(compiled);
    await onModuleActivate(compiled);

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

  run(argv: string[]): void | Promise<void> {
    const args = parseArgs(argv) as ChoArgs;
    const showHelp = args.help ?? args.h ?? false;

    // if there is a main command, always run it (main and sub does not mix)
    if ("main" in this.appRef) {
      if (showHelp) {
        return this.showHelp(this.appRef.main);
      }
      return this.apply(this.appRef.main, args);
    }

    // do we have a sub command?
    if (!args._[0]) {
      if (this.appRef.errorHandler) {
        return this.appRef.errorHandler(
          new MissingCommandError(),
          new ChoCommandContext(args),
        );
      }
      throw new MissingCommandError();
    }

    // route to subcommand
    const route = args._[0] as string;
    const subArgs = {
      ...args,
      _: args._.slice(1), // remove the route from args
    };

    if (!this.appRef.commands[route]) {
      if (this.appRef.errorHandler) {
        return this.appRef.errorHandler(
          new NotFoundError(),
          new ChoCommandContext(subArgs),
        );
      }
      throw new NotFoundError();
    }

    if (showHelp) {
      return this.showHelp(this.appRef.commands[route]);
    }

    return this.apply(this.appRef.commands[route], subArgs);
  }

  async apply(cmd: LinkedCommand, args: any): Promise<void> {
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
    } finally {
      await onModuleShutdown(this.instance);
    }
  }

  showHelp(cmd: LinkedCommand): void {
    if ("help" in cmd.compiled.meta) {
      console.log(cmd.compiled.meta.help);
    } else {
      throw new MissingHelpError();
    }
  }
}
