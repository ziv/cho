import { Ctr, Token } from "../core/di/types.ts";
import { ModuleInit } from "./lifecycle.ts";
import debuglog from "../core/utils/debuglog.ts";
import {
  EndPointDescriptor,
  ProcessedController,
  ProcessedFeature,
} from "./types.ts";
import {GetController, GetFeature, getMethods, GetMiddleware} from "./meta.ts";
import { GetInjectable, GetInjector } from "../core/di/meta.ts";
import Injector from "../core/di/injector.ts";

const log = debuglog("ChoWebBuilder");

/**
 * Convert feature class into a processed feature
 * - Feature can contain sub-features and controllers
 * - Feature is a module, so it has its own injector and module lifecycle
 * - Each feature and controller is instantiated with its dependencies
 */
export default class ChoWebBuilder {
  async build(ctr: Ctr): Promise<ProcessedFeature> {
    log(ctr.name, "building feature");
    const feature = GetFeature(ctr);
    const injector = GetInjector(ctr);

    // create feature instance
    const instance = await this.instance<ModuleInit>(
      injector,
      ctr,
      GetInjectable(ctr).dependencies,
    );
    log(`${ctr.name} instance created`);

    if (instance.init) {
      await instance.init();
    }
    log(`${ctr.name} initialized`);

    // build all sub-features
    const features: ProcessedFeature[] = [];
    for (const f of feature.features) {
      features.push(await this.build(f));
    }

    // build all controllers
    const controllers: ProcessedController[] = [];
    for (const controllerCtr of feature.controllers) {
      // controllers are not modules and does not
      // have lifecycle hooks, and don't have
      // their own injector so we use the feature injector
      const route = GetController(controllerCtr).route;
      const controller = await this.instance(
        injector,
        controllerCtr,
        GetInjectable(controllerCtr).dependencies,
      );
      const endpoints: EndPointDescriptor[] = getMethods(controller as object);
      controllers.push({
        middlewares: [],
        route,
        controller,
        endpoints,
      });
      log(
        `${ctr.name} register controller ${ctr.name} with ${endpoints.length} endpoints`,
      );
    }

    // find all middlewares applied to the feature
    const middlewares = GetMiddleware(ctr);
    return {
      middlewares: [],
      route: feature.route,
      injector,
      features,
      controllers,
    };
  }

  private async instance<T>(injector: Injector, ctr: Ctr, deps: Token[]) {
    const args = await Promise.all(deps.map((d) => injector.resolve(d)));
    return Reflect.construct(ctr, args) as T;
  }
}
