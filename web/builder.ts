import type { Ctr } from "@chojs/core/di";
import { getInjectable } from "@chojs/core/di";
import { debuglog } from "@chojs/core/utils";
import { getController, getFeature, getMethods } from "./meta.ts";
import { FeatureDescriptor } from "./types.ts";

const log = debuglog("web:builder");
/**
 * Convert feature class into a processed FeatureDescriptor
 * - Feature can contain sub-features and controllers
 * - Controllers contain methods (endpoints)
 * - Each level can have its own middlewares
 *
 * @param ctr The feature class to build the descriptor from
 * @returns The constructed FeatureDescriptor
 * @throws Error if the provided class is not a feature or if any controller has no endpoints
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

  log(`feature "${ctr.name}" built`);
  return feature;
}
