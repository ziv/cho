import { Ctr, Instance, Provide, Target, Token } from "@chojs/core/di";
import { getInjector, Injector } from "@chojs/core/di";
import {
  ControllerDescriptor,
  FeatureDescriptor,
  Guard,
  MethodDescriptor,
  Middleware,
  NextFunction,
  RequestContext,
} from "./types.ts";
import { ControllerRef, FeatureRef, MethodRef } from "./refs.ts";
import { HttpError } from "./errors.ts";

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
  if (typeof middleware !== "function" && typeof middleware !== "object") {
    throw new Error(
      `Middleware must be a function or a class, got ${typeof middleware}`,
    );
  }
  const create = async <T>(key: keyof T) => {
    // class middleware, resolve instance and bind handle method
    // first, make sure the middleware is added to providers to allow self-injection
    // and caching the instance for future use
    // injector.desc.providers.push({ provide: middleware as Ctr });
    Provide(middleware as Token)(injector.desc);
    // now we can resolve the instance
    const instance = await injector.resolve(middleware as Token) as T;
    if (!instance || typeof instance[key] !== "function") {
      throw new Error(
        `Cannot create instance of middleware ${middleware.name}`,
      );
    }
    return instance;
  };

  // if instanceof Middleware
  if (
    middleware.prototype && typeof middleware.prototype.handle === "function"
  ) {
    const instance = await create<Middleware>("handle");
    return instance.handle.bind(instance);
  }

  // if instanceof Guard
  if (
    middleware.prototype && typeof middleware.prototype.canActivate === "function"
  ) {
    const instance = await create<Guard>("canActivate");
    const canActivate = instance.canActivate.bind(instance);

    // return a middleware function that calls canActivate
    return async function (ctx: RequestContext, next: NextFunction) {
      if (await canActivate(ctx, next)) {
        await next();
      } else {
        throw new HttpError(403, "Forbidden");
      }
    };
    // return instance.handle.bind(instance);
  }
  if (typeof middleware === "function") {
    // function middleware, use as is
    return middleware;
  }
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
  const middlewares: Target[] = [];
  for (const mw of desc.middlewares) {
    middlewares.push(await buildMiddleware(injector, mw));
  }
  const handler = (controller[desc.name as keyof typeof controller] as Target)
    .bind(controller);
  return new MethodRef(desc, handler, middlewares);
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
  // the below method is simpler but does not allow self-injection
  // const instance = await injector.create(desc.ctr);

  // add to providers to allow self-injection
  Provide(desc.ctr)(injector.desc);
  // injector.desc.providers.push({ provide: desc.ctr });
  const instance = await injector.resolve(desc.ctr);

  if (!instance) {
    throw new Error(`Cannot create instance of ${desc.ctr.name}`);
  }
  const middlewares: Target[] = [];
  for (const mw of desc.middlewares) {
    middlewares.push(await buildMiddleware(injector, mw));
  }
  const methods: MethodRef[] = [];
  for (const m of desc.methods) {
    methods.push(await buildMethod(injector, instance, m));
  }

  return new ControllerRef(desc, instance, middlewares, methods);
}

/**
 * Takes a FeatureDescriptor (abstract representation of a feature)
 * and builds a FeatureRef (concrete representation with instances),
 * ready for linking and serving.
 *
 * @param desc
 * @return The constructed FeatureRef
 * @throws Error if any instance cannot be created
 */
export async function buildRef(desc: FeatureDescriptor): Promise<FeatureRef> {
  const injector = getInjector(desc.ctr) ?? new Injector(desc.ctr);
  const instance = await injector.resolve(desc.ctr);
  if (!instance) {
    throw new Error(`Cannot create instance of ${desc.ctr.name}`);
  }

  // convert all middlewares into functions
  const middlewares: Target[] = [];
  for (const mw of desc.middlewares) {
    middlewares.push(await buildMiddleware(injector, mw));
  }

  const features: FeatureRef[] = [];
  for (const f of desc.features) {
    features.push(await buildRef(f));
  }

  const controllers: ControllerRef[] = [];
  for (const c of desc.controllers) {
    controllers.push(await buildController(injector, c));
  }

  return new FeatureRef(
    desc,
    instance,
    middlewares,
    injector,
    features,
    controllers,
  );
}
