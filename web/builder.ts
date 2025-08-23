import type { Ctr } from "@cho/core/di";
import { getInjector, Injector } from "@cho/core/di";
import { debuglog } from "@cho/core/utils";
import { ChoControllerDescriptor, ChoFeatureDescriptor } from "./types.ts";
import { getController, getFeature, getMethods } from "./meta.ts";

/**
 * Convert feature class into a processed feature
 * - Feature can contain sub-features and controllers
 * - Feature is a module, so it has its own injector and module lifecycle
 * - Each feature and controller is instantiated with its dependencies
 */
export class ChoWebBuilder {
  async build(ctr: Ctr): Promise<ChoFeatureDescriptor> {
    const log = debuglog(`${ctr.name}Builders`);
    log("building feature");
    // fetch the feature metadata as a base for ChoFeatureDescriptor
    const feature = getFeature(ctr) as Partial<ChoFeatureDescriptor>;
    if (!feature) {
      throw new Error(`${ctr.name} is not a feature`);
    }

    // set/gets the module injector
    feature.injector = getInjector(ctr) ?? new Injector(ctr);

    // create feature instance
    const instance = await feature.injector.create(ctr);
    log("instance created");

    if (instance.init) {
      await instance.init();
    }
    log("instance initialized");

    // recursively build all sub-features
    const features: ChoFeatureDescriptor[] = [];
    for (const f of feature.features) {
      features.push(await this.build(f));
    }

    // build all controllers
    const controllers: ChoControllerDescriptor = [];
    for (const controllerCtr of feature.controllers) {
      // controllers are not modules and does not
      // have lifecycle hooks, and don't have
      // their own injector so we use the feature injector
      const ctrDesc = getController(controllerCtr);
      const controller = await feature.injector.create(controllerCtr);
      const methods = getMethods(controller as object);
      controllers.push({
        middlewares: ctrDesc?.middlewares ?? [],
        route: ctrDesc?.route ?? "",
        controller,
        methods,
      });
      log(
        `register controller ${controllerCtr.name} with ${methods.length} endpoints`,
      );
    }

    // return the completed feature descriptor
    return {
      ...feature,
      controllers,
      features,
    };
  }
}
