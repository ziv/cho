import {
  Any,
  type Ctr,
  type InjectableDescriptor,
  type ModuleDescriptor,
  type Target,
  type Token,
} from "../core/di/types.ts";
import Injector from "../core/di/injector.ts";

export type MiddlewareDescriptor = {
  middlewares: (Ctr | Target)[];
};

export type WithRoute = {
  /**
   * The relative route of the endpoint (e.g. "/users" or "/:id").
   */
  route: string;
};
export type WithMiddlewares = {
  /**
   * Middlewares applied to this route.
   */
  middlewares: MiddlewareDescriptor[];
};

export type MethodDescriptor = WithRoute & WithMiddlewares & {
  /**
   * The HTTP method of the endpoint (e.g. "GET", "POST", "PUT", "DELETE").
   */
  method: string;

  /**
   * The name of the method on the controller (property key).
   */
  name: string;
};

export type ControllerDescriptor =
  & InjectableDescriptor
  & WithRoute
  & WithMiddlewares;

export type FeatureDescriptor =
  & InjectableDescriptor
  & WithRoute
  & WithMiddlewares
  & {
    controllers: Ctr[];
    features: Ctr[];
  };

export type WithRouteAndMiddlewares = {
  /**
   * The relative route of the endpoint (e.g. "/users" or "/:id").
   */
  route: string;

  /**
   * Middlewares applied to this route.
   */
  middlewares: MiddlewareDescriptor[];
};

export type EndPointDescriptor = WithRouteAndMiddlewares & {
  /**
   * The name of the method on the controller (property key).
   */
  name: string;

  /**
   * The HTTP method of the endpoint (e.g. "GET", "POST", "PUT", "DELETE").
   */
  method: string;
};

export type ProcessedController = WithRouteAndMiddlewares & {
  /**
   * The instance of the controller.
   */
  controller: Any;

  /**
   * List of endpoints.
   */
  endpoints: EndPointDescriptor[];
};

export type ProcessedFeature = WithRouteAndMiddlewares & {
  /**
   * The module injector of the feature.
   */
  injector: Injector;

  /**
   * List of sub-features.
   */
  features: ProcessedFeature[];

  /**
   * List of controllers.
   */
  controllers: ProcessedController[];
};
