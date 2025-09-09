import type { Any, Ctr, InjectableDescriptor, ModuleDescriptor, Target } from "@chojs/core";
import type { Context } from "./context.ts";

export type Routed = {
  /**
   * The relative route of the endpoint (e.g. "/users" or "/:id").
   * The "route" value does not contain the prefixed slash ("/").
   */
  route: string;
  middlewares: (Ctr | Target)[];
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
  }
>;

// types for middleware and guards

/**
 * Interface for guards that control access to routes.
 * Guards must implement canActivate method that returns true to allow access.
 */
export interface ChoGuard {
  canActivate(...args: unknown[]): Promise<boolean>;
}

/**
 * Interface for middleware classes that can process requests.
 * Middleware must implement handle method to process the request context.
 */
export interface ChoMiddleware {
  handle(ctx: Context<Any>, next: Next): Promise<void>;
}

// compiled types

/**
 * Function type for calling the next middleware in the chain.
 */
export type Next = () => void | Promise<void>;
/**
 * Function type for middleware that processes request context and calls next.
 */
export type Middleware<T = Any> = (ctx: Context<T>, next: Next) => void | Response | Promise<void | Response>;
/**
 * Interface for input validators that can safely parse and validate data.
 */
export type Validator = { safeParse: (data: unknown) => { success: boolean; data: unknown; error: unknown } };

/**
 * HTTP method types supported by the framework, including standard HTTP methods and special types like SSE and WebSocket.
 */
export type MethodType =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "OPTIONS"
  | "HEAD"
  | "SSE"
  | "SSEIT"
  | "WS"
  | "STREAM";

/**
 * Validator interface for method arguments with safe parsing capabilities.
 */
export type ArgValidator = { safeParse: (data: unknown) => { success: boolean; data: unknown; error: unknown } };
/**
 * Types of arguments that can be extracted from HTTP requests.
 */
export type ArgType = "param" | "query" | "header" | "body" | "cookie";

/**
 * Configuration for a method argument, specifying how to extract and validate data from the request.
 */
export type MethodArgType = {
  type: ArgType;
  key?: string;
  validator?: ArgValidator;
};

/**
 * Factory function that creates method arguments from the request context.
 */
export type MethodArgFactory = (ctx: Context) => Promise<Any[]>;

/**
 * Generic type for linking objects with route and middleware information.
 */
export type Linked<T> = T & { route: string; middlewares: Middleware[] };

/**
 * A compiled method with its handler, HTTP method type, and argument factory.
 */

export type LinkedMethod = Linked<{ handler: Target; type: MethodType; args: MethodArgFactory }>;
/**
 * A compiled controller with its methods and routing information.
 */

export type LinkedController = Linked<{ methods: LinkedMethod[] }>;

/**
 * A compiled feature with its controllers and sub-features, forming a tree structure.
 */
export type LinkedFeature = Linked<{ controllers: LinkedController[]; features: LinkedFeature[] }>;
