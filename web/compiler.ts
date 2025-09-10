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
   * Build a tree of features, controllers, methods and middlewares
   * with all dependencies resolved.
   * @param ctr
   */
  async compile(
    ctr: Ctr,
  ): Promise<LinkedFeature> {
    const compiled = await this.feature(ctr);
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
   * @param mws
   * @param injector
   * @protected
   */
  protected async middlewares(
    mws: (Target | Ctr)[],
    injector: Injector,
  ): Promise<Middleware[]> {
    const middlewares: Middleware[] = [];
    for (const mw of mws) {
      if (typeof mw !== "function") {
        if (this.options.silent) {
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

  /**
   * Process a controller method into a linked method.
   * Read its metadata, create its argument factory, bind its handler,
   * and process its middlewares.
   * Return null if the method has no metadata (not a route handler).
   *
   * @param ctr
   * @param controller
   * @param method
   * @param injector
   * @protected
   */
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
    const handler = (controller[method as keyof typeof controller] as Target)
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

  // utils

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
