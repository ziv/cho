import type { Any, Target } from "@chojs/core/meta";
import type { LinkedFeature, LinkedMethod, Middleware } from "./types.ts";
import type { Adapters, SseAdapter, StreamAdapter } from "./adapter.ts";

export type LinkerPlugin = {
  match(method: LinkedMethod): boolean;
  create(method: LinkedMethod): Middleware;
};

export class Linker<
  Application = Any,
  Feature = Any,
> {
  constructor(readonly adapter: Adapters, readonly plugins: LinkerPlugin[] = []) {
  }

  link(root: LinkedFeature): Application {
    return this.adapter.mountApp<Application>(this.apply(root), root.route);
  }

  protected apply(ref: LinkedFeature): Feature {
    const feature = this.adapter.createFeature(this.createMiddlewares(ref.middlewares));

    for (const c of ref.controllers) {
      const controller = this.adapter.createController(this.createMiddlewares(c.middlewares));

      for (const e of c.methods) {
        const type = e.type.toLocaleLowerCase();
        let endpoint;
        switch (type) {
          case "get":
          case "post":
          case "put":
          case "delete":
          case "patch":
          case "head":
            // todo do we need the "createEndpoint" method at all?!
            endpoint = this.adapter.createEndpoint(e.handler, e.args);
            break;
          case "stream":
            // todo what if adapter does not support streaming?!
            if ("createStreamEndpoint" in this.adapter) {
              endpoint = (this.adapter as StreamAdapter).createStreamEndpoint(e.handler, e.args);
            }
            break;
          case "sse":
            // todo what if adapter does not support streaming?!
            if ("createSseEndpoint" in this.adapter) {
              endpoint = (this.adapter as SseAdapter).createSseEndpoint(e.handler, e.args);
            }
            break;
          default: {
            const plugin = this.pluginsHandler(e);
            if (!plugin) {
              throw new Error(`Unsupported method type: ${e.type}`);
            }
            endpoint = plugin.create(e);
            break;
          }
        }
        // what if no endpoint could be created?!
        // an error suppose to be thrown above already
        if (!endpoint) {
          continue;
        }
        this.adapter.mountEndpoint(
          controller,
          this.createMiddlewares(e.middlewares),
          endpoint,
          e.route,
          e.type,
        );
      }
      this.adapter.mountController(feature, controller, c.route);
    }

    for (const f of ref.features) {
      this.adapter.mountFeature(feature, this.apply(f), f.route);
    }
    return feature;
  }

  /**
   * Find a plugin that matches the method type.
   * @param method
   * @protected
   */
  protected pluginsHandler(method: LinkedMethod): LinkerPlugin | null {
    for (const p of this.plugins) {
      if (p.match(method)) {
        return p;
      }
    }
    return null;
  }

  /**
   * Create middleware handlers from middleware targets.
   * @param middlewares
   * @protected
   */
  protected createMiddlewares(middlewares: Middleware[]): Target[] {
    return middlewares.map((mw) => this.adapter.createMiddleware(mw));
  }
}
