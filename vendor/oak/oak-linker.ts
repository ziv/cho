import { debuglog } from "@chojs/core/utils";
import { Any, Target } from "@chojs/core/di";
import { Router, RouterContext, RouterMiddleware } from "@oak/oak/router";
import { Application, Next } from "@oak/oak";
import type { LinkedController, LinkedFeature, Middleware } from "../types.ts";
import { ChoLinker } from "../linker.ts";
import { OakContext } from "./oak-context.ts";

const log = debuglog("vendor:oak-linker");

const toMiddleware = (mw: Target): RouterMiddleware<Any> => (c: RouterContext<Any>, next: Next) =>
  mw(new OakContext(c), next);

const withMiddlewares = (mws: Middleware[]): Router => {
  const c = new Router();
  for (const mw of mws) {
    c.use(toMiddleware(mw));
  }
  return c;
};

export class OakLinker implements ChoLinker {
  app!: Application;

  ref(): Application {
    if (!this.app) {
      throw new Error("Feature not linked yet");
    }
    return this.app;
  }

  handler(): (request: Request) => Promise<Response> {
    return async (request: Request) => {
      const res = await this.app.handle(request);
      return res ?? Response.error();
    };
  }

  link(ref: LinkedFeature): boolean {
    log("linking oak application");
    this.app = new Application();
    this.app.use(this.createFeature(ref).routes());
    return true;
  }

  createController(ref: LinkedController): Router {
    const controller = withMiddlewares(ref.middlewares);

    // link methods with their middlewares
    for (const endpoint of ref.methods) {
      const type = endpoint.type.toLowerCase();
      const middlewares = endpoint.middlewares.map(toMiddleware);

      // if (type === "sse" || type === "sseit" || type === "ws" || type === "stream") {
      //   // not implemented yet
      //   throw new Error(`Method type "${type}" not implemented yet in OakLinker`);
      // }

      if (
        type === "get" ||
        type === "post" ||
        type === "put" ||
        type === "delete" ||
        type === "patch"
      ) {
        log(`attaching endpoint ${type.toUpperCase()} "${endpoint.route}"`);
        controller[type](
          // todo handle root route properly
          "/" + endpoint.route,
          // @ts-ignore
          ...middlewares,
          async (c) => {
            // const res = await endpoint.handler(new OakContext(c));
            // if (res instanceof Response) {
            //   return res;
            // }
            // need to be more careful here
            // oak auto convert to json if res is object.
            // any other type sent as plain text
            // **should find a better way to handle this**
            c.response.body = await endpoint.handler(new OakContext(c));
          },
        );
        continue;
      }
      throw new Error(`Unsupported method detected "${type}"`);
    }
    // if route is not empty, create a new router for use it
    return (ref.route === "") ? controller : new Router().use("/" + ref.route, controller.routes());
  }

  createFeature(ref: LinkedFeature): Router {
    const feature = withMiddlewares(ref.middlewares);

    // attach controllers
    for (const ctrl of ref.controllers) {
      const controller = this.createController(ctrl);
      log(`attaching controller at route "${ctrl.route}"`);

      feature.use(
        // ctrl.route,
        controller.routes(),
      );
    }

    // attach sub-features
    for (const feat of ref.features) {
      log(`attaching sub-feature at route "${feat.route}"`);
      const sub = this.createFeature(feat);
      feature.use(
        feat.route,
        sub.routes(),
        sub.allowedMethods(),
      );
    }

    return feature;
  }
}
