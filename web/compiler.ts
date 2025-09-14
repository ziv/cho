import type { Ctr, Instance, Target } from "@chojs/core/meta";
import { Injector, readMetadataObject } from "@chojs/core";
import type { ControllerDescriptor, FeatureDescriptor, MethodArgType, MethodDescriptor, Routed } from "./types.ts";
import type { ChoGuard } from "./interfaces/guard.ts";
import type { Context } from "./interfaces/context.ts";
import type { ErrorHandler } from "./interfaces/error-handler.ts";
import type { MethodArgFactory, Middleware, Next } from "./interfaces/adapter.ts";
import {
  CircularDependencyError,
  EmptyControllerError,
  InvalidInputError,
  NotControllerError,
  NotFeatureError,
  NotMiddlewareError,
  UnauthorizedError,
} from "./errors.ts";
import { debuglog } from "@chojs/core/utils";
import { isClass } from "./utils.ts";
import {ChoMiddleware} from "./interfaces/middleware.ts";

const log = debuglog("web:compiler");

/**
 * HTTP method types supported by the framework, including standard HTTP methods and special types like SSE and WebSocket.
 */
export type MethodType =
  // standard HTTP methods
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  // extended methods
  | "SSE"
  | "WS"
  | "STREAM"
  | "STREAM_TEXT"
  | "STREAM_ASYNC"
  | "STREAM_ASYNC_TEXT"
  | "STREAM_PIPE";

/**
 * Generic type for linking objects with route and middleware information.
 */
export type Linked<T> = T & { route: string; middlewares: Middleware[]; errorHandler?: Target };

/**
 * A compiled method with its handler, HTTP method type, and argument factory.
 */

export type CompiledMethod = Linked<
  { handler: Target; type: MethodType; args: MethodArgFactory }
>;
/**
 * A compiled controller with its methods and routing information.
 */

export type CompiledController = Linked<{ methods: CompiledMethod[] }>;

/**
 * A compiled feature with its controllers and sub-features, forming a tree structure.
 */
export type CompiledFeature = Linked<
  { controllers: CompiledController[]; features: CompiledFeature[] }
>;

/**
 * Compiler options for customizing the behavior of the Compiler.
 */
export type CompilerOptions = {
  /**
   * Will suppress all non-critical errors if true.
   */
  silent: boolean;
};

/**
 * Why a class when we have a function? (already debated)
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
   * Build a tree of features, controllers (instances),
   * methods and middlewares with all dependencies resolved.
   * @param ctr
   */
  async compile(
    ctr: Ctr,
  ): Promise<CompiledFeature> {
    const end = log.start();
    const compiled = await this.feature(ctr);
    end("feature compiled");
    if (!compiled) {
      // maybe silent mode, so no feature created,
      // but here we expect at least one feature
      // so throw error
      throw new NotFeatureError(ctr);
    }
    return compiled;
  }

  /**
   * Process an array of middlewares and guards into an array of middlewares.
   * Guards are converted into middlewares that throw UnauthorizedError if the guard fails.
   *
   * @param routed
   * @param injector
   * @protected
   */
  protected async middlewares(
    routed: Routed,
    injector: Injector,
  ): Promise<Middleware[]> {
    const middlewares: Middleware[] = [];
    for (const mw of (routed.middlewares ?? [])) {
      if (typeof mw !== "function") {
        if (this.options.silent) {
          log.error(`Middleware is not a function: ${mw}`);
          continue;
        }
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
        middlewares.push(async (c: Context, next: Next) => {
          const pass = await handler(c);
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

  /**
   * Process a controller method into a linked method.
   * Read its metadata, create its argument factory, bind its handler,
   * and process its middlewares.
   * Return null if the method has no metadata (not a route handler).
   *
   * @param meta
   * @param controller
   * @param injector
   * @protected
   */
  protected async method(
    meta: MethodDescriptor,
    controller: Instance,
    injector: Injector,
  ): Promise<CompiledMethod> {
    const handler = (controller[meta.name as keyof typeof controller] as Target)
      .bind(
        controller,
      );
    const args = this.createMethodArgFactory(meta.args);
    const middlewares: Middleware[] = await this.middlewares(
      meta,
      injector,
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
   * Process a controller class into a linked controller.
   * Read its metadata, create its instance, process its methods and middlewares.
   * Return null if the class has no controller metadata.
   *
   * @param ctr
   * @param injector
   * @protected
   */
  protected async controller(
    ctr: Ctr,
    injector: Injector,
  ): Promise<CompiledController | null> {
    this.circularDependencyGuard(ctr);

    // type guard
    const meta = readMetadataObject<ControllerDescriptor>(ctr);
    if (!meta) {
      if (this.options.silent) {
        log.error(`Class is not a controller: ${ctr.name}`);
        return null;
      }
      throw new NotControllerError(ctr);
    }

    // find its props
    const props = Object.getOwnPropertyNames(
      ctr.prototype,
    ) as (string & keyof typeof ctr.prototype)[];

    // take only methods with metadata
    // ignore constructor
    // if no methods with metadata, throw error (unless silent)
    const metas = props
      .filter((name) => name !== "constructor")
      .filter((name) => typeof ctr.prototype[name] === "function")
      .map((name) => readMetadataObject<MethodDescriptor>(ctr.prototype[name]))
      .filter(Boolean) as MethodDescriptor[];

    if (0 === metas.length) {
      if (!this.options.silent) {
        log.error(`Controller has no routes: ${ctr.name}`);
        throw new EmptyControllerError(ctr);
      }
      return null;
    }

    // create the controller instance
    const controller = await injector.register(ctr).resolve<Instance>(ctr);

    const methods: CompiledMethod[] = [];
    for (const m of metas) {
      methods.push(await this.method(m, controller, injector));
    }

    const middlewares: Middleware[] = await this.middlewares(
      meta as Routed,
      injector,
    );

    const errorHandler = await this.errorHandler(meta as Routed, injector);

    return {
      route: meta.route ?? "",
      middlewares,
      methods,
      errorHandler,
    };
  }

  /**
   * Process a feature class into a linked feature.
   * Read its metadata, process its controllers, features and middlewares.
   * Return null if the class has no feature metadata.
   *
   * @param ctr
   * @protected
   */
  protected async feature(
    ctr: Ctr,
  ): Promise<CompiledFeature | null> {
    this.circularDependencyGuard(ctr);

    // type guard
    const meta = readMetadataObject<FeatureDescriptor>(ctr);
    if (!meta) {
      if (this.options.silent) {
        log.error(`Class is not a feature: ${ctr.name}`);
        return null;
      }
      throw new NotFeatureError(ctr);
    }

    // resolving self
    const injector = await Injector.get(ctr);

    const controllers: CompiledController[] = [];
    for (const c of meta.controllers ?? []) {
      const ctrl = await this.controller(c, injector);
      if (ctrl) {
        controllers.push(ctrl);
      }
    }

    const features: CompiledFeature[] = [];
    for (const f of meta.features ?? []) {
      const feat = await this.feature(f);
      if (feat) {
        features.push(feat);
      }
    }

    const middlewares: Middleware[] = await this.middlewares(
      meta as Routed,
      injector,
    );

    const errorHandler = await this.errorHandler(meta as Routed, injector);

    return {
      route: meta.route ?? "",
      middlewares,
      controllers,
      features,
      errorHandler,
    };
  }

  // utils

  async errorHandler(meta: Routed, injector: Injector): Promise<Target | undefined> {
    const errorHandler = meta.errorHandler;

    if (typeof errorHandler !== "function") {
      return undefined;
    }

    if (!isClass(errorHandler)) {
      return errorHandler;
    }

    if (typeof errorHandler.prototype.catch !== "function") {
      throw new Error("Error handler class must have a catch method");
    }

    const instance = await injector.register(errorHandler as Ctr).resolve<ErrorHandler>(errorHandler as Ctr);
    return instance.catch.bind(instance);
  }

  /**
   * Guard against circular dependencies by tracking resolved classes.
   * If a class is already in the resolved set, throw CircularDependencyError.
   *
   * @param ctr
   * @protected
   */
  protected circularDependencyGuard(
    ctr: Ctr,
  ) {
    if (this.resolved.has(ctr)) {
      throw new CircularDependencyError(ctr);
    }
    this.resolved.add(ctr);
  }

  /**
   * Create a method argument factory from an array of method argument types.
   * The factory extracts and validates arguments from the request context.
   *
   * @param args
   * @protected
   */
  protected createMethodArgFactory(
    args: MethodArgType[],
  ): MethodArgFactory {
    return async function (ctx: Context): Promise<unknown[]> {
      // unable to read body multiple times, so cache it
      let body: any = undefined;

      const ret: unknown[] = [];

      for (const arg of args) {
        let value;
        switch (arg.type) {
          case "param":
            value = arg.key ? ctx.req.param(arg.key) : ctx.req.param();
            break;
          case "query":
            value = arg.key ? ctx.req.query(arg.key) : ctx.req.query();
            break;
          case "header":
            value = arg.key ? ctx.req.header(arg.key) : ctx.req.header();
            break;
          case "body":
            if (!body) {
              body = await ctx.req.json();
            }
            value = (arg.key && arg.key in body) ? body[arg.key] : body;
            break;
          default:
            // todo convert to internal error
            throw new Error(`Unrecognized method: ${arg.type}`);
        }

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
