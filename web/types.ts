import type { Any, Ctr, InjectableDescriptor, ModuleDescriptor, Target } from "@chojs/core";
import type { ChoContext, MethodArgType, Next } from "@chojs/vendor";

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

export interface ChoGuard {
  canActivate(...args: unknown[]): Promise<boolean>;
}

export interface ChoMiddleware {
  handle(ctx: ChoContext<Any>, next: Next): Promise<void>;
}
