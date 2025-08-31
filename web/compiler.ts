import type { Any, Ctr, Instance, Target } from "@chojs/core/di";
import { Injector, readMetadataObject } from "@chojs/core/di";
import type {
  ChoContext,
  LinkedController,
  LinkedFeature,
  LinkedMethod,
  MethodType,
  Middleware,
  Next,
} from "@chojs/vendor";
import type { ChoGuard, ChoMiddleware, ControllerDescriptor, FeatureDescriptor } from "./types.ts";
import { readMethod, readMiddlewares } from "./meta.ts";

// is is middleware class
const isMiddleware = (mw: Target): mw is Ctr => mw.prototype && typeof mw.prototype.handle === "function";

// is guard class
const isGuard = (mw: Target): mw is Ctr => mw.prototype && typeof mw.prototype.canActivate === "function";

/**
 * Compute a middleware.
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
  const meta = readMethod(ctr.prototype[method]);
  if (!meta) {
    return null;
  }
  const mws = readMiddlewares(ctr.prototype[method]);
  const middlewares = await Promise.all(mws.map((mw) => middleware(mw, injector)));

  const handler = (controller[method as keyof typeof controller] as Target).bind(controller);
  return {
    route: meta.route,
    type: meta.type as MethodType,
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
async function controller(ctr: Ctr, injector: Injector): Promise<LinkedController> {
  const meta = readMetadataObject<ControllerDescriptor>(ctr);
  if (!meta) {
    throw new Error(`${ctr.name} is not a controller`);
  }

  // todo missing middlewares handling

  injector.register(ctr);
  const controller = await injector.resolve<Instance>(ctr);

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
  const methods = (await Promise.all(metaMethods.map((name) => method(ctr, controller, name, injector)))).filter(
    Boolean,
  ) as LinkedMethod[];

  const mws = readMiddlewares(ctr);
  const middlewares = await Promise.all(mws.map((mw) => middleware(mw, injector)));

  return {
    route: meta.route,
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

  const controllers = await Promise.all(meta.controllers.map((c: Ctr) => controller(c, injector)));
  const features = await Promise.all(meta.features.map((f: Ctr) => feature(f)));

  const mws = readMiddlewares(ctr);
  const middlewares = await Promise.all(mws.map((mw) => middleware(mw, injector)));

  return {
    route: meta.route ?? "",
    middlewares,
    controllers,
    features,
  };
}

/**
 * Compile a feature module into a linked feature.
 * Build an abstract tree of features, controllers, methods and middlewares
 * with all dependencies resolved.
 * @param ctr
 */
export default function compiler(ctr: Ctr): Promise<LinkedFeature> {
  return feature(ctr);
}
