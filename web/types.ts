import type { Any, Ctr, Injector, Target } from "@cho/core/di";

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
    controllers: Ctr[];
    features: Ctr[];
  };

export type ChoControllerDescriptor = ControllerDescriptor & {
  /**
   * The instance of the controller.
   */
  controller: Any;
  methods: MethodDescriptor[];
};

export type ChoFeatureDescriptor = FeatureDescriptor & {
  injector: Injector;
  controllers: ChoControllerDescriptor[];
  features: ChoFeatureDescriptor[];
};

/**
 * a
 * a
 * ----
 * a
 * a
 */

/** */

/** */
// export type EndPointDescriptor = WithRouteAndMiddlewares & {
//   /**
//    * The name of the method on the controller (property key).
//    */
//   name: string;
//
//   /**
//    * The HTTP method of the endpoint (e.g. "GET", "POST", "PUT", "DELETE").
//    */
//   method: string;
// };
//
// export type ProcessedController = WithRouteAndMiddlewares & {
//   /**
//    * The instance of the controller.
//    */
//   controller: Any;
//
//   /**
//    * List of endpoints.
//    */
//   endpoints: MethodDescriptor[];
// };

// export type ProcessedFeature = WithRouteAndMiddlewares & {
//   /**
//    * The module injector of the feature.
//    */
//   injector: Injector;
//
//   /**
//    * List of sub-features.
//    */
//   features: ProcessedFeature[];
//
//   /**
//    * List of controllers.
//    */
//   controllers: ProcessedController[];
// };
