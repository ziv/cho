import type { Injector, Instance, Target } from "@chojs/core";
import type { ControllerDescriptor, FeatureDescriptor, MethodDescriptor } from "./types.ts";

/**
 * A reference to a method, including its descriptor, handler function, and middlewares.
 */
export class MethodRef {
  constructor(
    readonly desc: MethodDescriptor,
    readonly handler: Target,
    readonly middlewares: Target[] = [],
  ) {
  }
}

/**
 * A reference to a controller, including its descriptor, instance, middlewares, and methods.
 */
export class ControllerRef {
  constructor(
    readonly desc: ControllerDescriptor,
    readonly instance: Instance,
    readonly middlewares: Target[] = [],
    readonly methods: MethodRef[] = [],
  ) {
  }
}

/**
 * A reference to a feature, including its descriptor, instance, middlewares, injector, sub-features, and controllers.
 */
export class FeatureRef {
  constructor(
    readonly desc: FeatureDescriptor,
    readonly instance: Instance,
    readonly injector: Injector,
    readonly middlewares: Target[] = [],
    readonly features: FeatureRef[] = [],
    readonly controllers: ControllerRef[] = [],
  ) {
  }
}
