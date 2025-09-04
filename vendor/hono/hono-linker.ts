import { debuglog } from "@chojs/core/utils";
import { Target } from "@chojs/core/di";
import type { Context, MiddlewareHandler, Next } from "./deps.ts";
import { Hono } from "./deps.ts";
import type { LinkedController, LinkedFeature, Middleware } from "../types.ts";
import { ChoLinker } from "../linker.ts";
import { HonoContext } from "./hono-context.ts";

const log = debuglog("vendor:hono-linker");

const toMiddleware = (mw: Target): MiddlewareHandler => (c: Context, next: Next) => mw(new HonoContext(c), next);

const withMiddlewares = (mws: Middleware[]): Hono => {
  const c = new Hono();
  for (const mw of mws) {
    c.use(toMiddleware(mw));
  }
  return c;
};

export class HonoLinker implements ChoLinker {
  app!: Hono;

  ref(): Hono {
    if (!this.app) {
      throw new Error("Feature not linked yet");
    }
    return this.app;
  }

  handler(): (request: Request) => Promise<Response> {
    return this.app.fetch as (request: Request) => Promise<Response>;
  }

  link(ref: LinkedFeature): boolean {
    log("linking hono application");
    this.app = this.createFeature(ref);
    return true;
  }

  protected createController(ref: LinkedController): Hono {
    const controller = withMiddlewares(ref.middlewares);

    for (const endpoint of ref.methods) {
      const type = endpoint.type.toLowerCase();
      const middlewares = endpoint.middlewares.map(toMiddleware);

      if (
        type === "get" ||
        type === "post" ||
        type === "put" ||
        type === "delete" ||
        type === "patch"
      ) {
        controller[type](endpoint.route, ...middlewares, async (c: Context) => {
          const res = await endpoint.handler(new HonoContext(c));
          if (res instanceof Response) {
            return res;
          }
          // default to json response
          return c.json(res);
        });
        continue;
      }
      throw new Error(`Unsupported method detected "${type}"`);
    }
    return controller;
  }

  protected createFeature(ref: LinkedFeature): Hono {
    const feature = withMiddlewares(ref.middlewares);

    for (const ctrl of ref.controllers) {
      log(`attaching controller at route "${ctrl.route}"`);
      feature.route(
        ctrl.route,
        this.createController(ctrl),
      );
    }

    for (const feat of ref.features) {
      log(`attaching sub-feature at route "${feat.route}"`);
      feature.route(
        feat.route,
        this.createFeature(feat),
      );
    }

    return feature;
  }
}
