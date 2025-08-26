import type { Instance, Target, Token } from "@chojs/core/di";
import { getInjector, Injector, Provide } from "@chojs/core/di";
import { debuglog } from "@chojs/core/utils";
import type {
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

const log = debuglog("web:builder-ref");
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
  log(`building middleware of ${middleware.name}`);
  if (typeof middleware !== "function" && typeof middleware !== "object") {
    throw new Error(
      `Middleware must be a function or a class, got ${typeof middleware}`,
    );
  }
  const create = async <T>(key: keyof T) => {
    // first, make sure the middleware is added to providers to
    // allow self-injection and cache the instance
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

  // if instanceof Middleware
  if (
    middleware.prototype && typeof middleware.prototype.handle === "function"
  ) {
    return create<Middleware>("handle");
  }

  // if instanceof Guard
  if (
    middleware.prototype && typeof middleware.prototype.canActivate === "function"
  ) {
    const canActivate = await create<Guard>("canActivate");
    // return a middleware function that calls canActivate
    return async function (ctx: RequestContext, next: NextFunction) {
      if (await canActivate(ctx, next)) {
        await next();
      } else {
        throw new HttpError(403, "Forbidden");
      }
    };
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
  log(`building method ref for ${desc.ctr.name}`);
  const mtd = new MethodRef(
    desc,
    (controller[desc.name as keyof typeof controller] as Target)
      .bind(controller),
  );

  for (const mw of desc.middlewares) {
    mtd.middlewares.push(await buildMiddleware(injector, mw));
  }

  return mtd;
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
  // this method is simpler but does not allow self-injection
  // const instance = await injector.create(desc.ctr);

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
 * @param desc
 * @return The constructed FeatureRef
 * @throws Error if any instance cannot be created
 */
export async function buildRef(desc: FeatureDescriptor): Promise<FeatureRef> {
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
