import type { Ctr, Target, Token } from "@chojs/core";

/**
 * A middleware must implement a `handle` method that takes any arguments
 */
export interface Middleware {
  handle(...args: any[]): any;
}

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
