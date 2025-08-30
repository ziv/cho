import { Any, Ctr, getInjectable, getInjector, Injector, Instance, Provide, Target, Token } from "@chojs/core/di";
import { debuglog } from "@chojs/core/utils";
import type { ChoGuard, ChoMiddleware } from "./types.ts";
import {
  type ControllerDescriptor,
  ControllerRef,
  type FeatureDescriptor,
  FeatureRef,
  type MethodDescriptor,
  MethodRef,
} from "./refs.ts";
import { AsGuard } from "./fn.ts";
import { getController, getFeature, getMethods } from "./meta.ts";
import { ChoContext } from "@chojs/vendor";

const log = debuglog("web:builder");

/**
 * Convert feature class into a processed FeatureDescriptor
 * - Feature can contain sub-features and controllers
 * - Controllers contain methods (endpoints)
 * - Each level can have its own middlewares
 *
 * @param ctr The feature class to build the descriptor from
 * @returns The constructed FeatureDescriptor
 * @throws Error if the provided class is not a feature or if any controller has no endpoints
 */
export function build(ctr: Ctr): FeatureDescriptor {
  const meta = getFeature(ctr);
  if (!meta) {
    throw new Error(`${ctr.name} is not a feature`);
  }

  const feature: FeatureDescriptor = {
    ctr,
    dependencies: getInjectable(ctr)?.dependencies ?? [],
    route: meta.route,
    middlewares: meta.middlewares,
    features: [],
    controllers: [],
  };

  for (const ftr of meta.features) {
    feature.features.push(build(ftr));
  }

  for (const ctrl of meta.controllers) {
    const controller = getController(ctrl);
    if (!controller) {
      throw new Error(`${ctrl.name} is not a controller`);
    }

    const methods = getMethods(ctrl);
    if (methods.length === 0) {
      throw new Error(`Controller ${ctrl.name} has no endpoints`);
    }

    feature.controllers.push({
      ctr: ctrl,
      dependencies: getInjectable(ctrl)?.dependencies ?? [],
      route: controller.route,
      middlewares: controller.middlewares,
      methods,
    });
  }

  log(`feature "${ctr.name}" built`);
  return feature;
}

/**
 * Builds a middleware function from a class or function.
 *
 * @param injector
 * @param middleware
 * @returns The middleware function
 */
async function buildMiddleware(
  injector: Injector,
  middleware: Target,
): Promise<Target> {
  log(`building middleware of ${middleware?.name}`);
  if (typeof middleware !== "function" && typeof middleware !== "object") {
    throw new Error(
      `Middleware must be a function or a class, got ${typeof middleware}`,
    );
  }

  /**
   * Takes a class middleware and creates an instance,
   * then returns the specified method bound to the instance.
   * The returned method can be used as a middleware function.
   *
   * @param key
   */
  const create = async <T>(key: keyof T) => {
    // first, make sure the middleware is added to the injector providers
    // list to allow self-injection and caching of the instance
    // (we apply the decorator directly to the descriptor of the injector)
    Provide(middleware as Token)(injector.desc);

    // now we can resolve the instance
    const instance = await injector.resolve(middleware as Token) as T;

    if (!instance || typeof instance[key] !== "function") {
      throw new Error(
        `Cannot create instance of middleware ${middleware.name}`,
      );
    }
    return instance[key].bind(instance);
  };

  // if instanceof ChoMiddleware
  if (
    middleware.prototype && typeof middleware.prototype.handle === "function"
  ) {
    return create<ChoMiddleware>("handle");
  }

  // if instanceof ChoGuard
  if (
    middleware.prototype && typeof middleware.prototype.canActivate === "function"
  ) {
    const canActivate = await create<ChoGuard>("canActivate");
    // return a middleware function that calls canActivate
    return AsGuard(canActivate);
  }

  // if middleware is a function
  if (typeof middleware === "function") {
    // function middleware, use as is
    return middleware;
  }

  // unknown type
  throw new Error(`Invalid middleware type: ${typeof middleware}`);
}

/**
 * Builds a MethodRef from a MethodDescriptor by resolving its middlewares and binding its handler.
 *
 * @param injector
 * @param controller
 * @param desc
 * @returns The constructed MethodRef
 */
async function buildMethod(
  injector: Injector,
  controller: Instance,
  desc: MethodDescriptor,
): Promise<MethodRef> {
  log(`building method ref for ${desc.ctr?.name}`);

  // bind the method to the controller instance to preserve `this` and work with functions
  const fn = (controller[desc.name as keyof typeof controller] as Target).bind(controller);

  /**
   * Endpoint handler that wraps the original method,
   * @param c
   */
  async function httpHandler(c: ChoContext<Any>) {
    try {
      const ret = await fn(c);
      // if the handler returns a Response, use it as is
      if (ret instanceof Response) {
        return ret;
      }
      // return default JSON response
      return c.json(ret);
    } catch (error) {
      // todo better error handling
      throw error;
    }
  }

  let ref: MethodRef;

  switch (desc.method.toLowerCase()) {
    case "sse":
    case "sseit":
    case "stream":
    case "ws":
      // keep the raw function to allow custom handling
      ref = new MethodRef(desc, fn);
      break;

    case "get":
    case "post":
    case "put":
    case "patch":
    case "delete":
    default:
      // for standard HTTP methods, use the httpHandler wrapper
      ref = new MethodRef(desc, httpHandler);
      break;
  }

  // attach middlewares
  for (const mw of desc.middlewares) {
    ref.middlewares.push(await buildMiddleware(injector, mw));
  }

  return ref;
}

/**
 * Builds a ControllerRef from a ControllerDescriptor by creating its instance,
 * resolving its middlewares, and building its methods.
 *
 * @param injector
 * @param desc
 * @returns The constructed ControllerRef
 * @throws Error if the controller instance cannot be created
 */
async function buildController(
  injector: Injector,
  desc: ControllerDescriptor,
): Promise<ControllerRef> {
  log(`building controller ref for ${desc.ctr.name}`);
  // add to providers to allow self-injection and resolve the instance
  Provide(desc.ctr)(injector.desc);
  const instance = await injector.resolve(desc.ctr);

  if (!instance) {
    throw new Error(`Cannot create instance of ${desc.ctr.name}`);
  }

  const ctr = new ControllerRef(desc, instance);

  for (const mw of desc.middlewares) {
    ctr.middlewares.push(await buildMiddleware(injector, mw));
  }

  for (const m of desc.methods) {
    ctr.methods.push(await buildMethod(injector, instance, m));
  }

  return ctr;
}

/**
 * Takes a FeatureDescriptor (abstract representation of a feature)
 * and builds a FeatureRef (concrete representation with instances),
 * ready for linking and serving.
 *
 * @param ctr
 * @return The constructed FeatureRef
 * @throws Error if any instance cannot be created
 */
export async function buildRef(ctr: Ctr): Promise<FeatureRef> {
  // stage 0: convert class into descriptor
  const desc = build(ctr);

  log(`building feature ref for ${desc.ctr.name}`);
  const injector = getInjector(desc.ctr) ?? new Injector(desc.ctr);
  const instance = await injector.resolve(desc.ctr);

  if (!instance) {
    throw new Error(`Cannot create instance of ${desc.ctr.name}`);
  }

  const feat = new FeatureRef(desc, instance, injector);

  // convert all middlewares into functions
  for (const mw of desc.middlewares) {
    feat.middlewares.push(await buildMiddleware(injector, mw));
  }

  for (const f of desc.features) {
    feat.features.push(await buildRef(f));
  }

  for (const c of desc.controllers) {
    feat.controllers.push(await buildController(injector, c));
  }

  return feat;
}
