import type { Any, Ctr, Instance, Target } from "@chojs/core";
import { Injector, readMetadataObject } from "@chojs/core";
import type {
    ChoGuard,
    ChoMiddleware,
    ControllerDescriptor,
    FeatureDescriptor,
    LinkedController,
    LinkedFeature,
    LinkedMethod,
    MethodArgFactory,
    MethodArgType,
    MethodDescriptor,
    MethodType,
    Middleware,
    Next,
} from "./types.ts";
import type { Context } from "./context.ts";
import {
    CircularDependencyError,
    EmptyControllerError,
    InvalidInputError,
    NotControllerError,
    NotFeatureError,
    NotMiddlewareError,
    UnauthorizedError,
} from "./errors.ts";

/**
 * Compile a feature module into a linked feature.
 * Build a tree of features, controllers, methods and middlewares
 * with all dependencies resolved.
 * @param ctr
 */
export function compile(ctr: Ctr): Promise<LinkedFeature> {
    // is middleware class
    const isMiddleware = (mw: Target): mw is Ctr =>
        mw.prototype && typeof mw.prototype.handle === "function";

    // is guard class
    const isGuard = (mw: Target): mw is Ctr =>
        mw.prototype && typeof mw.prototype.canActivate === "function";

    function createMethodArgFactory(args: MethodArgType[]): MethodArgFactory {
        return async function (ctx: Context) {
            let body: any = undefined;
            const fromRequest = async (type: string) => {
                switch (type) {
                    case "param":
                        return ctx.params();
                    case "query":
                        return ctx.query();
                    case "header":
                        return ctx.headers();
                    case "body":
                        if (!body) body = await ctx.jsonBody();
                        return body;
                }
            };

            const ret = [];
            for (const arg of args) {
                const temp = await fromRequest(arg.type);
                const value = arg.key ? temp?.[arg.key] : temp;
                if (!arg.validator) {
                    ret.push(value);
                    continue;
                }
                const parsed = arg.validator.safeParse(value);
                if (!parsed.success) {
                    const message = arg.key
                        ? `Input validation failed at argument ${arg.type}.${arg.key}`
                        : `Input validation failed at argument ${arg.type}`;
                    throw new InvalidInputError(parsed.error, message);
                }

                ret.push(parsed.data);
            }
            return ret;
        };
    }

    /**
     * Compile a middleware.
     * If it is a class, resolve it and convert it into a function.
     * If it is already a function, return it as is.
     *
     * @param mw
     * @param injector
     */
    async function middleware(
        mw: Target | Ctr,
        injector: Injector,
    ): Promise<Middleware> {
        if (typeof mw !== "function") {
            throw new NotMiddlewareError(mw);
        }
        if (isMiddleware(mw)) {
            const instance = await injector.register(mw as Ctr).resolve<
                ChoMiddleware
            >(mw);
            return instance.handle.bind(instance) as Middleware;
        }
        if (isGuard(mw)) {
            const instance = await injector.register(mw as Ctr).resolve<
                ChoGuard
            >(mw);
            const handler = instance.canActivate.bind(instance);
            return async function (c: Context<Any>, next: Next) {
                const pass = await handler(c, next);
                if (pass) {
                    next();
                } else {
                    throw new UnauthorizedError();
                }
            };
        }
        // mw is a function
        return Promise.resolve(mw as Middleware);
    }

    /**
     * Compile all middlewares to an array of functions.
     * @param mws
     * @param injector
     */
    async function allMiddlewares(
        mws: (Target | Ctr)[],
        injector: Injector,
    ): Promise<Middleware[]> {
        const middlewares: Middleware[] = [];
        for (const mw of mws) {
            middlewares.push(await middleware(mw, injector));
        }
        return middlewares;
    }

    /**
     * Compile a method of a controller.
     * If the method has no metadata, return null.
     * Otherwise, read its metadata, middlewares and create the handler function.
     *
     * @param ctr
     * @param controller
     * @param method
     * @param injector
     */
    async function method(
        ctr: Target,
        controller: Instance,
        method: string,
        injector: Injector,
    ): Promise<LinkedMethod | null> {
        const meta = readMetadataObject<MethodDescriptor>(
            ctr.prototype[method],
        );
        if (!meta) {
            return null;
        }
        const middlewares: Middleware[] = await allMiddlewares(
            meta.middlewares ?? [],
            injector,
        );
        const args = createMethodArgFactory(meta.args);
        const handler =
            (controller[method as keyof typeof controller] as Target)
                .bind(
                    controller,
                );

        return {
            route: meta.route,
            type: meta.type as MethodType,
            args,
            middlewares,
            handler,
        };
    }

    /**
     * Compile a controller into a linked controller.
     * Read its metadata, middlewares and methods.
     * @param ctr
     * @param injector
     */
    async function controller(
        ctr: Ctr,
        injector: Injector,
    ): Promise<LinkedController> {
        const meta = readMetadataObject<ControllerDescriptor>(ctr);
        if (!meta) {
            // todo add option for silence errors
            throw new NotControllerError(ctr);
        }

        const controller = await injector.register(ctr).resolve<Instance>(ctr);

        const props = Object.getOwnPropertyNames(
            ctr.prototype,
        ) as (string & keyof typeof ctr.prototype)[];

        // get methods that have metadata
        const metaMethods = props
            .filter((name) => name !== "constructor")
            .filter((name) => typeof ctr.prototype[name] === "function");

        if (0 === metaMethods.length) {
            throw new EmptyControllerError(ctr);
        }

        const methods: LinkedMethod[] = [];
        for (const name of metaMethods) {
            const m = await method(ctr, controller, name, injector);
            if (m) {
                methods.push(m);
            }
        }

        const middlewares: Middleware[] = await allMiddlewares(
            meta.middlewares ?? [],
            injector,
        );

        return {
            route: meta.route ?? "",
            middlewares,
            methods,
        };
    }

    /**
     * Compile a feature module into a linked feature.
     * Build an abstract tree of features, controllers, methods and middlewares
     * with all dependencies resolved.
     * @param ctr
     */
    async function feature(
        ctr: Ctr,
    ): Promise<LinkedFeature> {
        const meta = readMetadataObject<FeatureDescriptor>(ctr);
        if (!meta) {
            throw new NotFeatureError(ctr);
        }
        const injector = await Injector.get(ctr);

        const controllers: LinkedController[] = [];
        for (const c of meta.controllers ?? []) {
            controllers.push(await controller(c, injector));
        }

        const features: LinkedFeature[] = [];
        for (const f of meta.features ?? []) {
            features.push(await feature(f));
        }

        const middlewares: Middleware[] = await allMiddlewares(
            meta.middlewares ?? [],
            injector,
        );

        return {
            route: meta.route ?? "",
            middlewares,
            controllers,
            features,
        };
    }

    return feature(ctr);
}

export type CompilerOptions = {
    /**
     * Will suppress all non-critical errors if true.
     */
    silent: boolean;
};

/**
 * Why a class when we have a function?
 * - Because we need to keep track of circular dependencies (done).
 * - Because we might want to add options in the future (done).
 * - Because we might want to extend it.
 * - Because we might want to keep some state.
 * - Because we might want to add lifecycle hooks.
 */
export class Compiler {
    protected readonly resolved: WeakSet<Target> = new WeakSet<Target>();

    constructor(readonly options: Partial<CompilerOptions> = {}) {
        this.options.silent = this.options.silent ?? false; // set explicit default
    }

    /**
     * Compile a feature module into a linked feature.
     * Build a tree of features, controllers, methods and middlewares
     * with all dependencies resolved.
     * @param ctr
     */
    async compile(ctr: Ctr): Promise<LinkedFeature> {
        const compiled = await this.feature(ctr);
        if (!compiled) {
            // maybe silent mode, so no feature created,
            // but here we expect at least one feature
            // so throw error
            throw new NotFeatureError(ctr);
        }
        return compiled;
    }

    protected async middlewares(
        mws: (Target | Ctr)[],
        injector: Injector,
    ): Promise<Middleware[]> {
        const middlewares: Middleware[] = [];
        for (const mw of mws) {
            if (typeof mw !== "function") {
                throw new NotMiddlewareError(mw);
            }

            if (
                // is middleware class
                mw.prototype && typeof mw.prototype.handle === "function"
            ) {
                const instance = await injector
                    .register(mw as Ctr)
                    .resolve<ChoMiddleware>(mw as Ctr);
                middlewares.push(instance.handle.bind(instance) as Middleware);
                continue;
            }

            if (
                // is guard class
                mw.prototype && typeof mw.prototype.canActivate === "function"
            ) {
                const instance = await injector
                    .register(mw as Ctr)
                    .resolve<ChoGuard>(mw as Ctr);
                const handler = instance.canActivate.bind(instance);
                middlewares.push(async (c: Context<Any>, next: Next) => {
                    const pass = await handler(c, next);
                    if (pass) {
                        next();
                    } else {
                        throw new UnauthorizedError();
                    }
                });
                continue;
            }
            // mw is a function
            middlewares.push(mw as Middleware);
        }
        return middlewares;
    }

    protected async method(
        ctr: Target,
        controller: Instance,
        method: string,
        injector: Injector,
    ): Promise<LinkedMethod | null> {
        const meta = readMetadataObject<MethodDescriptor>(
            ctr.prototype[method],
        );
        if (!meta) {
            return null;
        }
        const middlewares: Middleware[] = await this.middlewares(
            meta.middlewares ?? [],
            injector,
        );
        const args = this.createMethodArgFactory(meta.args);
        const handler =
            (controller[method as keyof typeof controller] as Target)
                .bind(
                    controller,
                );

        return {
            route: meta.route,
            type: meta.type as MethodType,
            args,
            middlewares,
            handler,
        };
    }

    protected async controller(
        ctr: Ctr,
        injector: Injector,
    ): Promise<LinkedController | null> {
        this.circularDependencyGuard(ctr);

        // type guard
        const meta = readMetadataObject<ControllerDescriptor>(ctr);
        if (!meta) {
            if (this.options.silent) {
                return null;
            }
            throw new NotControllerError(ctr);
        }

        // find its props
        const props = Object.getOwnPropertyNames(
            ctr.prototype,
        ) as (string & keyof typeof ctr.prototype)[];

        // take only methods
        const metaMethods = props
            .filter((name) => name !== "constructor")
            .filter((name) => typeof ctr.prototype[name] === "function");

        if (0 === metaMethods.length) {
            if (!this.options.silent) {
                throw new EmptyControllerError(ctr);
            }
        }

        // create the controller instance
        const controller = await injector.register(ctr).resolve<Instance>(ctr);

        const methods: LinkedMethod[] = [];
        for (const name of metaMethods) {
            const m = await this.method(ctr, controller, name, injector);
            if (m) {
                methods.push(m);
            }
        }

        const middlewares: Middleware[] = await this.middlewares(
            meta.middlewares ?? [],
            injector,
        );

        return {
            route: meta.route ?? "",
            middlewares,
            methods,
        };
    }

    protected async feature(
        ctr: Ctr,
    ): Promise<LinkedFeature | null> {
        this.circularDependencyGuard(ctr);

        // type guard
        const meta = readMetadataObject<FeatureDescriptor>(ctr);
        if (!meta) {
            if (this.options.silent) {
                return null;
            }
            throw new NotFeatureError(ctr);
        }

        // resolving self
        const injector = await Injector.get(ctr);

        const controllers: LinkedController[] = [];
        for (const c of meta.controllers ?? []) {
            const ctrl = await this.controller(c, injector);
            if (ctrl) {
                controllers.push(ctrl);
            }
        }

        const features: LinkedFeature[] = [];
        for (const f of meta.features ?? []) {
            const feat = await this.feature(f);
            if (feat) {
                features.push(feat);
            }
        }

        const middlewares: Middleware[] = await this.middlewares(
            meta.middlewares ?? [],
            injector,
        );

        return {
            route: meta.route ?? "",
            middlewares,
            controllers,
            features,
        };
    }

    // utils for extension

    protected circularDependencyGuard(
        ctr: Ctr,
    ) {
        if (this.resolved.has(ctr)) {
            throw new CircularDependencyError(ctr);
        }
        this.resolved.add(ctr);
    }

    protected createMethodArgFactory(
        args: MethodArgType[],
    ): MethodArgFactory {
        return async function (ctx: Context) {
            let body: any = undefined;
            const fromRequest = async (type: string) => {
                switch (type) {
                    case "param":
                        return ctx.params();
                    case "query":
                        return ctx.query();
                    case "header":
                        return ctx.headers();
                    case "body":
                        if (!body) body = await ctx.jsonBody();
                        return body;
                }
            };

            const ret = [];
            for (const arg of args) {
                const temp = await fromRequest(arg.type);
                const value = arg.key ? temp?.[arg.key] : temp;
                if (!arg.validator) {
                    ret.push(value);
                    continue;
                }
                const parsed = arg.validator.safeParse(value);
                if (!parsed.success) {
                    const message = arg.key
                        ? `Input validation failed at argument ${arg.type}.${arg.key}`
                        : `Input validation failed at argument ${arg.type}`;
                    throw new InvalidInputError(parsed.error, message);
                }

                ret.push(parsed.data);
            }
            return ret;
        };
    }
}
