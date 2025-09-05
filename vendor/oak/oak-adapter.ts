import { ChoAdapter } from "../adapter.ts";
import { type Next, Router, type RouterContext, type RouterMiddleware } from "@oak/oak/router";
import { Application } from "@oak/oak";

import { Application, Router } from "./deps";
import { OakContext } from "./oak-context.ts";

export class OakAdapter extends ChoAdapter<Application, Router, Router, RouterMiddleware> {
  createMiddleware(handler): RouterMiddleware {
    return function (c, next) {
      return handler(new OakContext(c), next);
    };
  }

  createEndpoint(handler) {
    return async function (c: RouterContext) {
      const ret = await handler(new OakContext(c));
      if (ret instanceof Response) {
        // todo need to be checked...
        c.respons.body = ret.body;
      } else {
        // in order to make default behavior
        // consistent, we set body as json
        c.response.headers.set("content-type", "application/json");
        c.response.body = res; // oak auto stringify object
      }
    };
  }

  createController(mws: RouterMiddleware[]): Router {
    const c = new Router();
    for (const mw of mws) {
      c.use(mw);
    }
    return c;
  }

  createFeature(mws: MiddlewareHandler[]): Router {
    return this.createController(mws);
  }

  mountEndpoint(
    ctr: Router,
    middlewares: RouterMiddleware[],
    endpoint: RouterMiddleware,
    route: string,
    httpMethod: string,
  ) {
    switch (httpMethod) {
      case "get":
      case "post":
      case "put":
      case "delete":
      case "patch":
        ctr[httpMethod]("/" + route, ...middlewares, endpoint);
        break;
      default:
        throw new Error(`Method type "${httpMethod}" not implemented yet in HonoAdapter`);
    }
  }

  // todo check the mounting with route
  mountController(feat: Router, controller: Router, route: string): void {
    if (route === "") {
      feat.use(controller.routes(), controller.allowedMethods());
    } else {
      const routed = new Router().use("/" + route, controller.routes(), controller.allowedMethods());
      feat.use(routed.routes(), routed.allowedMethods());
    }
  }

  mountFeature(to: Router, feat: Router, route: string): void {
    return this.mountController(to, feat, route);
  }

  mountApp(feature: Router): Application {
    const app = new Application();
    app.use(feature.routes());
    return app;
  }
}
