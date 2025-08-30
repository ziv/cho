import { debuglog } from "@chojs/core/utils";
import { Target } from "@chojs/core/di";
import { Context, Hono, MiddlewareHandler, Next } from "hono";
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
// import { streamSSE } from "hono/streaming";
// // import { upgradeWebSocket } from "hono/cloudflare-workers";
// import { ChoWebLinker, ControllerRef, FeatureRef } from "@chojs/web";
// import { Any } from "@chojs/core/di";
// import { HonoContext } from "./hono-context.ts";
//
// function attachController(ref: ControllerRef) {
//   const controller = new Hono();
//
//   // link controller middlewares
//   for (const mw of ref.middlewares) {
//     controller.use(mw as Any);
//   }
//
//   // link methods with their middlewares
//   for (const e of ref.methods) {
//     const method = e.desc.method.toLowerCase();
//     const mw = e.middlewares || []; // todo convert to hono middleware
//
//     // server-sent-events handling as stream
//     if ("sse" === method) {
//       controller.get(e.desc.route, ...mw, (c) => {
//         return streamSSE(c, (stream) => {
//           return e.handler(new HonoContext(c), stream);
//         });
//       });
//       continue;
//     }
//
//     // server-sent-events handling as async iterator
//     if ("sseit" === method) {
//       controller.get(e.desc.route, ...mw, (c) => {
//         return streamSSE(c, async (stream) => {
//           for await (const next of e.handler(new HonoContext(c))) {
//             stream.writeSSE(next);
//           }
//         });
//       });
//       continue;
//     }
//     // web-socket handling
//     // todo still need to be tested
//     // if ("ws" === method) {
//     //   controller.get(e.desc.route, ...mw, upgradeWebSocket(e.handler));
//     //   continue;
//     // }
//
//     if (
//       method === "get" ||
//       method === "post" ||
//       method === "put" ||
//       method === "delete" ||
//       method === "patch"
//     ) {
//       controller[method](e.desc.route, ...mw, (c) => {
//         // convert Hono Context to Cho Context
//         return e.handler(new HonoContext(c));
//       });
//       continue;
//     }
//
//     log.error(`Unsupported method "${method}", skipping...`);
//   }
//
//   return controller;
// }
//
// function attachHono(ref: FeatureRef) {
//   const feature = new Hono();
//
//   // link middlewares
//   for (const mw of ref.middlewares) {
//     feature.use(mw as Any);
//   }
//
//   // link sub-features
//   for (const feat of ref.features) {
//     feature.route(feat.desc.route, attachHono(feat));
//   }
//
//   // link controllers
//   for (const ctrl of ref.controllers) {
//     // attach the controller to the feature
//     feature.route(ctrl.desc.route, attachController(ctrl));
//   }
//
//   return feature;
// }
//
// export class HonoLinker extends ChoWebLinker<Hono> {
//   app!: Hono;
//
//   /**
//    * Get a reference to the underlying application instance
//    * Reference type is Hono
//    */
//   override ref(): Hono {
//     return this.app;
//   }
//
//   /**
//    * Get the application request handler
//    */
//   override handler(): (request: Request) => Promise<Response> {
//     return this.app.fetch as (request: Request) => Promise<Response>;
//   }
//
//   /**
//    * Create the web application
//    * @param ref
//    */
//   override link(ref: FeatureRef): boolean {
//     this.app = attachHono(ref);
//     return true;
//   }
// }
