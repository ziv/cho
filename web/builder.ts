import type { Ctr, Target, Token } from "@chojs/core/di";
import { getController, getFeature, getMethods } from "./meta.ts";
import { getInjectable } from "../core/di/meta.ts";

export type WithRoute<T> = T & {
  /**
   * The relative route of the endpoint (e.g. "/users" or "/:id").
   * The "route" value does not contain the prefixed slash ("/").
   */
  route: string;

  /**
   * Middlewares applied to this route.
   */
  middlewares: Target[];
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

export type FeatureDescriptor = WithRoute<{
  /**
   * The class of the feature.
   */
  ctr: Ctr;

  /**
   * List of injectable dependencies required by this feature.
   */
  dependencies: Token[];

  /**
   * List of controller classes within this feature.
   */
  controllers: ControllerDescriptor[];

  /**
   * List of sub-feature classes within this feature.
   */
  features: FeatureDescriptor[];
}>;

/**
 * Convert feature class into a processed FeatureDescriptor
 * - Feature can contain sub-features and controllers
 * - Controllers contain methods (endpoints)
 * - Each level can have its own middlewares
 */
export function build(ctr: Ctr): FeatureDescriptor {
  const meta = getFeature(ctr);
  if (!meta) {
    throw new Error(`${ctr.name} is not a feature`);
  }

  const feature: FeatureDescriptor = {
    ctr,
    dependencies: getInjectable(ctr)?.dependencies ?? [],
    route: meta.route,
    middlewares: meta.middlewares,
    features: [],
    controllers: [],
  };

  for (const ftr of meta.features) {
    feature.features.push(build(ftr));
  }

  for (const ctrl of meta.controllers) {
    const controller = getController(ctrl);
    if (!controller) {
      throw new Error(`${ctrl.name} is not a controller`);
    }

    const methods = getMethods(ctrl);
    if (methods.length === 0) {
      throw new Error(`Controller ${ctrl.name} has no endpoints`);
    }

    feature.controllers.push({
      ctr: ctrl,
      dependencies: getInjectable(ctrl)?.dependencies ?? [],
      route: controller.route,
      middlewares: controller.middlewares,
      methods,
    });
  }

  return feature;
}
