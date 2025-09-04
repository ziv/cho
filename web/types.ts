import type { Any, Ctr, InjectableDescriptor, ModuleDescriptor } from "@chojs/core/di";
import type { ChoContext, MethodArgType, Next } from "@chojs/vendor";

export type MethodDescriptor = {
  /**
   * The relative route of the endpoint (e.g. "/users" or "/:id").
   * The "route" value does not contain the prefixed slash ("/").
   */
  route: string;
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

export type ControllerDescriptor = InjectableDescriptor & { route: string };

export type FeatureDescriptor = Partial<ModuleDescriptor> & {
  route?: string;
  controllers: Ctr[];
  features: Ctr[];
};

export interface ChoGuard {
  canActivate(...args: unknown[]): Promise<boolean>;
}

export interface ChoMiddleware {
  handle(ctx: ChoContext<Any>, next: Next): Promise<void>;
}
