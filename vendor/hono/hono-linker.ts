// import { Hono } from "hono";
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
