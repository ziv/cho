import { Any } from "../core/di/types.ts";
import Injector from "../core/di/injector.ts";

export type EndPointDescriptor = {
  /**
   * The name of the method on the controller (property key).
   */
  name: string;

  /**
   * The relative route of the endpoint (e.g. "/users" or "/:id").
   */
  route: string;

  /**
   * The HTTP method of the endpoint (e.g. "GET", "POST", "PUT", "DELETE").
   */
  method: string;
};

export type ProcessedController = {
  /**
   * The relative route of the controller (e.g. "/users").
   */
  route: string;

  /**
   * The instance of the controller.
   */
  controller: Any;

  /**
   * List of endpoints.
   */
  endpoints: EndPointDescriptor[];
};

export type ProcessedFeature = {
  /**
   * The relative route of the feature (e.g. "/users").
   */
  route: string;

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
