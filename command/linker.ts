import { CompiledModule } from "../core/compiler/compiler.ts";
import { Target } from "../core/meta/mod.ts";
import { debuglog } from "../core/utils/debuglog.ts";

export type LinkedCommand = {
    middlewares: Target[];
    handle: Target;
    errorHandler?: Target;
    compiled: CompiledModule;
};

export type LinkedApp =
    | { main: LinkedCommand }
    | { commands: Record<string, LinkedCommand> };

const log = debuglog("cli:linker");

export class Linker {
    isMain = false;
    containSubs = false;

    /**
     * Link a compiled module to an application instance.
     * @param cm
     */
    link(cm: CompiledModule): LinkedApp {
        const end = log.start();
        this.isMain = false;
        this.containSubs = false;
        const linked = this.apply(cm, { commands: {} });
        end("module linked");
        return linked;
    }

    protected apply(cm: CompiledModule, app: LinkedApp): LinkedApp {
        const moduleMiddlewares = cm.middlewares ?? [];

        for (const cc of cm.controllers) {
            const controllerMiddlewares = cc.middlewares ?? [];

            for (const endpoint of cc.methods) {
                // this method is not a command
                if (!endpoint.meta.command) {
                    continue;
                }

                const command = endpoint.meta.command as string;

                // command already exists
                if (app.commands[command]) {
                    throw new Error(
                        `Command "${command}" already exists`,
                    );
                }

                if (command === "main" && this.containSubs) {
                    throw new Error(
                        "Cannot have 'main' command when subcommands exist",
                    );
                }

                if (command !== "main" && this.isMain) {
                    throw new Error(
                        "Cannot have subcommands when 'main' command exists",
                    );
                }

                // all middlewares for this endpoint
                const middlewares = [
                    ...moduleMiddlewares,
                    ...controllerMiddlewares,
                    ...(endpoint.middlewares ?? []),
                ];

                // error handler for this endpoint
                const errorHandler = endpoint.errorHandler ?? cc.errorHandler ??
                    cm.errorHandler;

                // attach controller to method for later instantiation
                log(`mount command: ${command}`);
                const cmd = {
                    middlewares,
                    handle: endpoint.handle,
                    errorHandler,
                    compiled: endpoint,
                };

                if (command === "main") {
                    this.isMain = true;
                    app.main = cmd;
                } else {
                    this.containSubs = true;
                    app.commands[command] = cmd;
                }
            }
        }

        // attach imported modules
        for (const im of cm.imports) {
            app = this.apply(im, app);
        }

        return app;
    }
}
