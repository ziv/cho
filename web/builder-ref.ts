import {
  ControllerDescriptor,
  FeatureDescriptor,
  MethodDescriptor,
} from "./builder.ts";
import { getInjector, Injector } from "@chojs/core/di";
import type { Instance, Target, Token } from "@chojs/core/di";

export interface Middleware {
  handle(...args: any[]): any;
}

export class MethodRef {
  constructor(
    readonly desc: MethodDescriptor,
    readonly handler: Target,
    readonly middlewares: Target[],
  ) {
  }
}

export class ControllerRef {
  constructor(
    readonly desc: ControllerDescriptor,
    readonly instance: Instance,
    readonly middlewares: Target[],
    readonly methods: MethodRef[],
  ) {
  }
}

export class FeatureRef {
  constructor(
    readonly desc: FeatureDescriptor,
    readonly instance: Instance,
    readonly middlewares: Target[],
    readonly injector: Injector,
    readonly features: FeatureRef[],
    readonly controllers: ControllerRef[],
  ) {
  }
}

async function buildMiddleware(
  injector: Injector,
  middleware: Target,
): Promise<Target> {
  if (typeof middleware !== "function" && typeof middleware !== "object") {
    throw new Error(
      `Middleware must be a function or a class, got ${typeof middleware}`,
    );
  }
  if (
    middleware.prototype && typeof middleware.prototype.handle === "function"
  ) {
    // class middleware, resolve instance and bind handle method
    const instance = await injector.resolve(middleware as Token) as Middleware;
    if (!instance || typeof instance.handle !== "function") {
      throw new Error(
        `Cannot create instance of middleware ${middleware.name}`,
      );
    }
    return instance.handle.bind(instance);
  } else if (typeof middleware === "function") {
    // function middleware, use as is
    return middleware;
  } else {
    throw new Error(`Invalid middleware type: ${typeof middleware}`);
  }
}

async function buildMethod(
  injector: Injector,
  controller: Instance,
  desc: MethodDescriptor,
) {
  const middlewares: Target[] = [];
  for (const mw of desc.middlewares) {
    middlewares.push(await buildMiddleware(injector, mw));
  }
  const handler = (controller[desc.name as keyof typeof controller] as Target)
    .bind(controller);
  return new MethodRef(desc, handler, middlewares);
}

async function buildController(injector: Injector, desc: ControllerDescriptor) {
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
