import type { Injector, Instance, Target } from "@chojs/core";
import type { MiddlewareHandler } from "./types.ts";
import { ChoWebLinker } from "./linker.ts";

/**
 * A type that extends another type T with routing information.
 */
export type WithRoute<T> = T & {
  /**
   * The relative route of the endpoint (e.g. "/users" or "/:id").
   * The "route" value does not contain the prefixed slash ("/").
   */
  route: string;

  /**
   * Middlewares applied to this route.
   */
  middlewares: Target[];
};

/**
 * Descriptor for a single method (endpoint) within a controller.
 */
export type MethodDescriptor = WithRoute<{
  /**
   * The HTTP method of the endpoint (e.g. "GET", "POST", "PUT", "DELETE").
   */
  method: string;

  /**
   * The name of the method on the controller (property key).
   */
  name: string;
}>;

/**
 * Descriptor for a controller class, including its methods (endpoints) and dependencies.
 */
export type ControllerDescriptor = WithRoute<{
  /**
   * The class of the controller.
   */
  ctr: Ctr;

  /**
   * List of injectable dependencies required by this controller.
   */
  dependencies: Token[];

  /**
   * List of methods (endpoints) within this controller.
   */
  methods: MethodDescriptor[];
}>;

/**
 * Descriptor for a feature class, including its controllers, sub-features, and dependencies.
 */
export type FeatureDescriptor = WithRoute<{
  /**
   * The class of the feature.
   */
  ctr: Ctr;

  /**
   * List of injectable dependencies required by this feature.
   */
  dependencies: Token[];

  /**
   * List of controller classes within this feature.
   */
  controllers: ControllerDescriptor[];

  /**
   * List of sub-feature classes within this feature.
   */
  features: FeatureDescriptor[];
}>;

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
    readonly middlewares: MiddlewareHandler[] = [],
    readonly features: FeatureRef[] = [],
    readonly controllers: ControllerRef[] = [],
  ) {
  }
}

/**
 * A reference to the entire application, including the linker and root feature.
 */
export class ApplicationRef {
  constructor(
    readonly link: ChoWebLinker,
    readonly appModule: FeatureRef,
  ) {
  }
}
