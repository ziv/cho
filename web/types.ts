import { Ctr, type ModuleDescriptor } from "@chojs/core/di";

export type WithRoute<T> = T & {
  /**
   * The relative route of the endpoint (e.g. "/users" or "/:id").
   * The "route" value does not contain the prefixed slash ("/").
   */
  route: string;
  /**
   * Middlewares applied to this route.
   */
  // middlewares: (Target | Ctr)[];
};

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

export type FeatureDescriptor = Partial<ModuleDescriptor> & {
  route?: string;
  controllers: Ctr[];
};

export interface ChoGuard {
  canActivate(...args: unknown[]): Promise<boolean>;
}

export interface ChoMiddleware {
  handle(...args: unknown[]): Promise<boolean>;
}
