import type { Ctr, Target } from "@cho/core/di";
import { getInjector, Injector } from "@cho/core/di";
import { debuglog } from "@cho/core/utils";
import type {
  ChoControllerDescriptor,
  ChoFeatureDescriptor,
  ChoMethodDescriptor,
  FeatureDescriptor,
} from "./types.ts";
import { getController, getFeature, getMethods } from "./meta.ts";

/**
 * Convert feature class into a processed feature
 * - Feature can contain sub-features and controllers
 * - Feature is a module, so it has its own injector and module lifecycle
 * - Each feature and controller is instantiated with its dependencies
 */
export class ChoWebBuilder {
  async build(ctr: Ctr): Promise<ChoFeatureDescriptor> {
    const log = debuglog(`${ctr.name}Builder`);

    // fetch the feature metadata as a base for ChoFeatureDescriptor
    const feature = getFeature(ctr) as Partial<FeatureDescriptor>;

    if (!feature) {
      throw new Error(`${ctr.name} is not a feature`);
    }
    log("building feature");

    // set/gets the module injector
    const injector = getInjector(ctr) ?? new Injector(ctr);

    // create feature instance
    const instance = await injector.create(ctr);
    log(`${ctr.name} instance created`);

    if (instance.init) {
      await instance.init();
    }
    log(`${ctr.name} instance initialized`);

    const features: ChoFeatureDescriptor[] = [];

    // recursively build all sub-features
    for (const f of feature.features) {
      features.push(await this.build(f));
    }

    const controllers: ChoControllerDescriptor = [];

    // build all controllers
    for (const controllerCtr of feature.controllers) {
      controllers.push(
        await this.buildController(controllerCtr, injector),
      );
      log(`controller ${controllerCtr.name} created`);
    }

    // return the completed feature descriptor
    const middlewares = await this.middlewares(feature.middlewares ?? []);
    return {
      ...feature,
      injector,
      features,
      controllers,
      middlewares,
    };
  }

  async buildController(
    ctr: Ctr,
    injector: Injector,
  ): Promise<ChoControllerDescriptor> {
    // controllers are not modules and does not
    // have lifecycle hooks, and don't have
    // their own injector so we use the feature injector
    const ctrDesc = getController(ctr);
    const controller = await injector.create(ctr);

    // read metadata of all methods (raw is just metadata without resolved middlewares)
    const rawMethods = getMethods(controller);
    if (rawMethods.length === 0) {
      throw new Error(`Controller ${ctr.name} has no methods`);
    }

    // this list contain the resolved middlewares
    const methods: ChoMethodDescriptor = [];

    for (const method of rawMethods) {
      // resolve all dependencies of method middlewares
      const middlewares = await this.middlewares(method.middlewares ?? []);

      // build the method descriptor
      methods.push({
        ...method,
        middlewares,
      });
    }

    // resolve all dependencies of controller middlewares
    const middlewares = await this.middlewares(ctrDesc.middlewares ?? []);

    return {
      route: ctrDesc?.route ?? "",
      controller,
      methods,
      middlewares,
    };
  }

  async middlewares(items: (Ctr | Target)[]) {
    const ret: Target[] = [];
    for (const middleware of items) {
      if (typeof middleware !== "function") {
        throw new Error(
          `Middleware should be a function or a class, got ${
            String(middleware)
          }`,
        );
      }

      /**
       * this is a class based middleware implementing `ChoMiddleware`,
       * so we need to instantiate it and convert it to a function
       */
      if (middleware.prototype && middleware.prototype.handle) {
        const mwInstance = await feature.injector.create(middleware as Ctr);
        const mwFunc = mwInstance.handle.bind(mwInstance);
        ret.push(mwFunc);
        continue;
      }

      /**
       * this is not the class we've expected, so we assume it's a function
       */
      middlewares.push(mw);
    }

    return ret;
  }
}
