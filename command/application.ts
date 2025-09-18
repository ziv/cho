import type { LinkedApp, LinkedCommand } from "./linker.ts";
import { Linker } from "./linker.ts";
import type { Ctr } from "../core/meta/mod.ts";
import {
    CompiledModule,
    Compiler,
    graphBuilder,
    onModuleActivate,
    onModuleInit,
    onModuleShutdown,
} from "../core/application/mod.ts";
import { parseArgs } from "@std/cli/parse-args";
import { ChoCommandContext } from "./context.ts";

export class MissingCommandError extends Error {}
export class NotFoundError extends Error {}

export class Application {
    /**
     * Create an application instance from a root controller.
     *
     * @param ctr
     */
    static async create(ctr: Ctr) {
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
        const args = parseArgs(argv);
        const showHelp = args.help ?? args.h ?? false;

        // if there is a main command, always run it (main and sub does not mix)
        if (this.appRef.main) {
            if (showHelp) {
                return this.showHelp(this.appRef.main);
            }
            return this.appRef(this.appRef.main, args);
        }

        // route to subcommand if exists
        const route = args._[0] as string;
        const subArgs = {
            ...args,
            _: args._.slice(1), // remove the route from args
        };

        if (!route) {
            if (this.appRef.errorHandler) {
                return this.appRef.errorHandler(
                    new MissingCommandError(),
                    new ChoCommandContext(args),
                );
            }
            throw new MissingCommandError();
        }

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
        console.log(cmd.compiled.meta?.help ?? "No help available.");
    }
}
