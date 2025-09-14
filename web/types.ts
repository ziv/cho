import type { Ctr, InjectableDescriptor, ModuleDescriptor, Target } from "@chojs/core";

export type Routed = {
  /**
   * The relative route of the endpoint (e.g. "/users" or "/:id").
   * The "route" value does not contain the prefixed slash ("/").
   */
  route: string;
  middlewares: (Ctr | Target)[];
  errorHandler?: Ctr | Target;
};
export type MethodDescriptor = Routed & {
  /**
   * The HTTP method of the endpoint (e.g. "GET", "POST", "PUT", "DELETE").
   */
  type: string;

  /**
   * The name of the method on the controller (property key).
   */
  name: string;

  /**
   * The argument to pass the method when invoked.
   * Each argument is represented by its type and an optional key.
   */
  args: MethodArgType[];
};

/**
 * Descriptor for a controller class, combining injectable and routing metadata.
 */
export type ControllerDescriptor = InjectableDescriptor & Partial<Routed>;

/**
 * Descriptor for a feature module, combining module, routing metadata with controllers and sub-features.
 */
export type FeatureDescriptor = Partial<
  ModuleDescriptor & Routed & {
    controllers: Ctr[];
    features: Ctr[];
    // support any extra metadata
    [key: string]: unknown[] | unknown;
  }
>;

// types for middleware and guards

// compiled types

/**
 * Interface for input validators that can safely parse and validate data.
 */
export type Validator = {
  safeParse: (
    data: unknown,
  ) => { success: boolean; data: unknown; error: unknown };
};

/**
 * Validator interface for method arguments with safe parsing capabilities.
 */
export type ArgValidator = {
  safeParse: (
    data: unknown,
  ) => { success: boolean; data: unknown; error: unknown };
};
/**
 * Types of arguments that can be extracted from HTTP requests.
 */
export type ArgType = "param" | "query" | "header" | "body" | "cookie";

/**
 * Configuration for a method argument, specifying how to extract and validate data from the request.
 */
export type MethodArgType<AT = ArgType> = {
  type: AT;
  key?: string;
  validator?: ArgValidator;
};
