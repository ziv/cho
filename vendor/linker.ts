import { Any } from "@chojs/core/di";
import type { LinkedFeature } from "./types.ts";
import { ChoAdapter } from "./adapter.ts";

/**
 * Abstract Web Linker class
 * Used as base class for linking a web application framework to Cho.js
 *
 * @abstract
 */
export class ChoLinker<App = Any> {
  constructor(readonly adapter: ChoAdapter) {
  }
  /**
   * Get a reference to the underlying application instance
   *
   * @return Router The application instance
   */
  ref(): App;

  /**
   * Get the application request handlers
   *
   * @return {(request: Request) => Promise<Response>} The request handler
   */
  handler(): (request: Request) => Promise<Response>;

  /**
   * Create the web application
   * @param ref
   * @return {boolean} true if successful
   */
  link(ref: LinkedFeature): boolean;

  linker(root: LinkedFeature) {
    const adapter = this.adapter;
    const toMiddleware = adapter.createMiddleware.bind(adapter);

    function process(ref: LinkedFeature) {
      const feature = adapter.createFeature(ref.middlewares.map(toMiddleware));

      // controllers
      for (const c of ref.controllers) {
        const controller = adapter.createController(c.middlewares.map(toMiddleware));

        // endpoints
        for (const e of c.methods) {
          adapter.mountEndpoint(
            controller,
            e.middlewares.map(toMiddleware),
            adapter.createEndpoint(e.handler),
            e.route,
            e.type,
          );
        }
        adapter.mountController(feature, controller, c.route);
      }

      // sub-features
      for (const f of ref.features) {
        adapter.mountFeature(feature, process(f), f.route);
      }

      return feature;
    }

    return adapter.mountApp(process(root));
  }
}
