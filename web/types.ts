import type { Any, Ctr, InjectableDescriptor, ModuleDescriptor, Target } from "@chojs/core";
import type {Context} from "./context.ts";

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

export type ControllerDescriptor = InjectableDescriptor & Partial<Routed>;

export type FeatureDescriptor = Partial<
  ModuleDescriptor & Routed & {
    controllers: Ctr[];
    features: Ctr[];
  }
>;

// types for middleware and guards

export interface ChoGuard {
  canActivate(...args: unknown[]): Promise<boolean>;
}

export interface ChoMiddleware {
  handle(ctx: Context<Any>, next: Next): Promise<void>;
}

// compiled types

export type Next = () => void | Promise<void>;
export type Middleware<T = Any> = (ctx: Context<T>, next: Next) => void | Promise<void>;
export type Validator = { safeParse: (data: unknown) => { success: boolean; data: unknown; error: unknown } };

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

export type ArgValidator = { safeParse: (data: unknown) => { success: boolean; data: unknown; error: unknown } };
export type ArgType = "param" | "query" | "header" | "body" | "cookie";

export type MethodArgType = {
  type: ArgType;
  key?: string;
  validator?: ArgValidator;
};

export type MethodArgFactory = (ctx: Context) => Promise<Any[]>;

export type Linked<T> = T & { route: string; middlewares: Middleware[] };
export type LinkedMethod = Linked<{ handler: Target; type: MethodType; args: MethodArgFactory }>;
export type LinkedController = Linked<{ methods: LinkedMethod[] }>;
export type LinkedFeature = Linked<{ controllers: LinkedController[]; features: LinkedFeature[] }>;
