import type { Any, Ctr, Instance, Target } from "@chojs/core";
import { Injector, readMetadataObject } from "@chojs/core";
import type {
  ChoContext,
  LinkedController,
  LinkedFeature,
  LinkedMethod,
  MethodType,
  Middleware,
  Next,
} from "@chojs/vendor";
import type { ChoGuard, ChoMiddleware, ControllerDescriptor, FeatureDescriptor, MethodDescriptor } from "./types.ts";

/**
 * Compile a feature module into a linked feature.
 * Build a tree of features, controllers, methods and middlewares
 * with all dependencies resolved.
 * @param ctr
 */
export default function compiler(ctr: Ctr): Promise<LinkedFeature> {
  // is middleware class
  const isMiddleware = (mw: Target): mw is Ctr => mw.prototype && typeof mw.prototype.handle === "function";

  // is guard class
  const isGuard = (mw: Target): mw is Ctr => mw.prototype && typeof mw.prototype.canActivate === "function";

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
      throw new Error(`Invalid middleware: ${mw}`);
    }
    if (isMiddleware(mw)) {
      const instance = await injector.register(mw as Ctr).resolve<ChoMiddleware>(mw);
      return instance.handle.bind(instance) as Middleware;
    }
    if (isGuard(mw)) {
      const instance = await injector.register(mw as Ctr).resolve<ChoGuard>(mw);
      const handler = instance.canActivate.bind(instance);
      return async function (c: ChoContext<Any>, next: Next) {
        const pass = await handler(c, next);
        if (pass) {
          next();
        } else {
          throw new Error("Unauthorized");
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
    const meta = readMetadataObject<MethodDescriptor>(ctr.prototype[method]);
    if (!meta) {
      return null;
    }
    const middlewares: Middleware[] = await allMiddlewares(meta.middlewares, injector);
    const args = meta.args.map((arg) => ((ctx: ChoContext<Any>) => ctx.getInput(arg)));

    const handler = (controller[method as keyof typeof controller] as Target).bind(controller);
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
      throw new Error(`${ctr.name} is not a controller`);
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
      throw new Error(`Controller ${ctr.name} has no endpoints`);
    }

    const methods: LinkedMethod[] = [];
    for (const name of metaMethods) {
      const m = await method(ctr, controller, name, injector);
      if (m) {
        methods.push(m);
      }
    }

    const middlewares: Middleware[] = await allMiddlewares(meta.middlewares ?? [], injector);

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
      throw new Error(`${ctr.name} is not a feature`);
    }
    const injector = Injector.read(ctr) ?? await Injector.create(ctr);

    const controllers: LinkedController[] = [];
    for (const c of meta.controllers ?? []) {
      await controller(c, injector);
      // controllers.map();
    }

    const features: LinkedFeature[] = [];
    for (const f of meta.features ?? []) {
      await feature(f);
      // features.map(await feature(f));
    }

    const middlewares: Middleware[] = await allMiddlewares(meta.middlewares ?? [], injector);

    return {
      route: meta.route ?? "",
      middlewares,
      controllers,
      features,
    };
  }

  return feature(ctr);
}
