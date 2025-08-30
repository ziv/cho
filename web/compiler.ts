import type { Ctr, Instance, Target, Token } from "@chojs/core/di";
import { getInjector, Injector, Provide } from "@chojs/core/di";
import type { LinkedController, LinkedFeature, LinkedMethod, MethodType, Middleware } from "@chojs/vendor";
import { debuglog } from "@chojs/core/utils";
import { getController, getFeature, getMethods } from "./meta.ts";
import { ChoGuard, ChoMiddleware } from "./refs.ts";
import { Any } from "../core/di/types.ts";

const isMiddlewareClass = (mw: Target): boolean => mw.prototype && typeof mw.prototype.handle === "function";
const isGuardClass = (mw: Target): boolean => mw.prototype && typeof mw.prototype.canActivate === "function";

const log = debuglog("cho:web:compiler");

export class Compiler {
  /**
   * Takes feature class and compiles it, resolving all dependencies.
   * The result is a tree of linked features, controllers and methods,
   * with all dependencies resolved and ready to be used by a web framework.
   */
  compile(ctr: Ctr): Promise<LinkedFeature> {
    return this.linkFeature(ctr);
  }

  /**
   * Recursively link a feature, its controllers, methods and sub-features.
   * @param ctr
   */
  private async linkFeature(ctr: Ctr): Promise<LinkedFeature> {
    log(`linking feature ${ctr.name}`);

    const meta = getFeature(ctr);
    if (!meta) {
      throw new Error(`${ctr.name} is not a feature`);
    }

    const injector = getInjector(ctr) ?? new Injector(ctr);

    const controllers: LinkedController[] = [];
    for (const c of meta.controllers) {
      controllers.push(await this.linkController(c, injector));
    }

    const features: LinkedFeature[] = [];
    for (const f of meta.features) {
      features.push(await this.linkFeature(f));
    }

    return {
      route: meta.route,
      middlewares: await this.buildMiddlewares(meta.middlewares, injector),
      controllers,
      features,
    };
  }

  private async linkController(ctr: Ctr, injector: Injector) {
    log(`linking controller ${ctr.name}`);
    const controller = getController(ctr);
    if (!controller) {
      throw new Error(`${ctr.name} is not a controller`);
    }

    const metaMethods = getMethods(ctr);
    if (metaMethods.length === 0) {
      throw new Error(`Controller ${ctr.name} has no endpoints`);
    }

    // create the controller

    if (!injector.provider(ctr)) {
      // add the controller to the injector providers to allow resolving its dependencies
      Provide(ctr)(injector.desc);
    }

    // resolve the controller instance
    const instance = await injector.resolve(ctr) as Instance;

    const methods: LinkedMethod[] = [];
    for (const m of metaMethods) {
      log(`linking method ${m.method} ${m.route} in controller ${ctr.name}`);
      // compiled  methods
      methods.push({
        route: m.route,
        type: m.method as MethodType,
        middlewares: await this.buildMiddlewares(m.middlewares, injector),
        handler: (instance[m.name as keyof typeof instance] as Target).bind(instance),
      });
    }

    // compiled controller
    return {
      route: controller.route,
      middlewares: await this.buildMiddlewares(controller.middlewares, injector),
      methods,
    };
  }

  /**
   * Middleware can be either a class or a function.
   *
   * If it is a function, we assume it is already a middleware.
   *
   * If it is a class, we check if it is implementing one
   * of the middleware interfaces, resolve it and convert it ito a function.
   *
   * Interfaces checked:
   * - Middleware: "handle" method
   * - CanActivate (Guard): "canActivate" method
   *
   * @param middlewares
   * @param injector
   */
  private async buildMiddlewares(middlewares: (Target | Ctr)[], injector: Injector): Promise<Middleware[]> {
    log(`building ${middlewares.length} middlewares`);
    const ret: Middleware[] = [];
    for (const mw of middlewares) {
      if (!isMiddlewareClass(mw) && !isGuardClass(mw)) {
        // assume it is a function
        ret.push(mw as Middleware);
        continue;
      }
      const key = isMiddlewareClass(mw) ? "handle" : "canActivate";
      if (!injector.provider(mw as Token)) {
        // before instancing, make sure the middleware is added to the injector
        // providers list to allow self-injection and caching of the instance
        Provide(mw as Token)(injector.desc);
      }

      const instance = await injector.resolve(mw as Token) as ChoGuard & ChoMiddleware;
      if (!instance || typeof instance[key] !== "function") {
        throw new Error(
          `Cannot create instance of middleware ${mw.name}`,
        );
      }

      // convert the method into a function
      ret.push((instance[key] as Target).bind(instance));
    }
    return ret;
  }
}
