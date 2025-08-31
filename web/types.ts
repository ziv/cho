import type {Ctr, InjectableDescriptor, ModuleDescriptor} from "@chojs/core/di";

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
  handle(...args: unknown[]): Promise<boolean>;
}
