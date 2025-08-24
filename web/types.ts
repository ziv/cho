import type { Ctr, Injector, Instance, Target } from "@cho/core/di";

export type WithRoute = {
  /**
   * The relative route of the endpoint (e.g. "/users" or "/:id").
   */
  route: string;

  /**
   * Middlewares applied to this route.
   */
  middlewares: Target[];
};

export type MethodDescriptor = WithRoute & {
  /**
   * The HTTP method of the endpoint (e.g. "GET", "POST", "PUT", "DELETE").
   */
  method: string;

  /**
   * The name of the method on the controller (property key).
   */
  name: string;
};

export type ControllerDescriptor = WithRoute;

export type FeatureDescriptor =
  & WithRoute
  & {
    /**
     * List of controller classes within this feature.
     */
    controllers: Ctr[];

    /**
     * List of sub-feature classes within this feature.
     */
    features: Ctr[];
  };

export type ChoMiddlewareDescriptor = Target; // todo fix with the right signature

export type ChoMethodDescriptor = MethodDescriptor & {
  middlewares: ChoMiddlewareDescriptor[];
};
export type ChoControllerDescriptor = ControllerDescriptor & {
  /**
   * The instance of the controller.
   */
  controller: Instance;
  methods: ChoMethodDescriptor[];
  middlewares: ChoMiddlewareDescriptor[];
};

export type ChoFeatureDescriptor = FeatureDescriptor & {
  injector: Injector;
  controllers: ChoControllerDescriptor[];
  features: ChoFeatureDescriptor[];
  middlewares: ChoMiddlewareDescriptor[];
};
