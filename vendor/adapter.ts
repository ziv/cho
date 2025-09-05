import type {Any, Target} from "@chojs/core";
import {ChoContext, Next} from "./types.ts";

export abstract class ChoAdapter<
  Application = Any,
  Feature = Any,
  Controller = Any,
  Middleware = Any,
> {
  /**
   * Takes cho middleware and converts it to the framework's middleware
   * @param mw
   */
  abstract createMiddleware(mw: (ctx: ChoContext, next: Next) => void): Middleware;

  /**
   * Takes cho endpoint handler and converts it to the framework's endpoint
   * @param mw
   */
  abstract createEndpoint(mw: Target): Middleware;

  /**
   * Takes cho controller and converts it to the framework's controller
   * @param mds
   */
  abstract createController(mds: Middleware[]): Controller;

  /**
   * Takes cho feature and converts it to the framework's feature
   * @param mds
   */
  abstract createFeature(mds: Middleware[]): Feature;

  /**
   * Mounts an endpoint to a controller
   * @param ctr
   * @param mws
   * @param endpoint
   * @param route
   * @param httpMethod
   */
  abstract mountEndpoint(
    ctr: Controller,
    mws: Middleware[],
    endpoint: Middleware,
    route: string,
    httpMethod: string,
  ): void;

  /**
   * Mounts a controller to a feature
   * @param feat
   * @param controller
   * @param route
   */
  abstract mountController(feat: Feature, controller: Controller, route: string): void;

  /**
   * Mounts a sub-feature to a feature
   * @param feat
   * @param feature
   * @param route
   */
  abstract mountFeature(feat: Feature, feature: Feature, route: string): void;

  /**
   * Mounts a top-level feature to the application
   * @param feature
   */
  abstract mountApp(feature: Feature): void;
}
//
// export function linker(adapter: ChoAdapter, top: LinkedFeature) {
//   // convert to function for simplicity
//   const toMiddleware = adapter.createMiddleware.bind(adapter);
//
//   function processFeature(ref: LinkedFeature): Application {
//     const feat = adapter.createFeature(ref.middlewares.map(toMiddleware));
//
//     // controllers
//     for (const c of ref.controllers) {
//       const controller = adapter.createController(c.middlewares.map(toMiddleware));
//
//       // endpoints
//       for (const e of c.methods) {
//         adapter.mountEndpoint(
//           controller,
//           e.middlewares.map(toMiddleware),
//           adapter.createEndpoint(e.handler),
//           e.route,
//           e.type,
//         );
//       }
//       adapter.mountController(feat, controller, c.route);
//     }
//
//     // sub-features
//     for (const f of ref.features) {
//       adapter.mountFeature(feat, processFeature(f), f.route);
//     }
//
//     return feat;
//   }
//
//   return adapter.mountApp(processFeature(top));
// }
