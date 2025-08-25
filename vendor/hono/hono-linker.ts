import { Hono } from "hono";
import { ChoWebLinker, FeatureRef } from "@chojs/web";
import { Target } from "@chojs/core";
import { Any } from "@chojs/core/di";

export class HonoLinker extends ChoWebLinker<Hono> {
  app!: Hono;

  /**
   * Get a reference to the underlying application instance
   * Reference type is Hono
   */
  override ref(): Hono {
    return this.app;
  }

  /**
   * Get the application request handler
   */
  override handler(): (request: Request) => Promise<Response> {
    return this.app.fetch as (request: Request) => Promise<Response>;
  }

  /**
   * Create the web application
   * @param ref
   */
  override link(ref: FeatureRef): boolean {
    this.app = this.attach(ref);
    return true;
  }

  private attach(desc: FeatureRef): Hono {
    const feature = new Hono();

    // link middlewares
    for (const mw of desc.middlewares) {
      feature.use(mw as Any);
    }

    // link sub-features
    for (const feat of desc.features) {
      feature.route(feat.desc.route, this.attach(feat));
    }

    // link controllers
    for (const ctrl of desc.controllers) {
      const controller = new Hono();

      // link middlewares
      for (const mw of ctrl.middlewares) {
        controller.use(mw as Any);
      }

      // link methods with their middlewares
      for (const e of ctrl.methods) {
        const method = e.desc.method.toLowerCase();
        const mw = e.middlewares || [];
        if (
          method === "get" ||
          method === "post" ||
          method === "put" ||
          method === "delete" ||
          method === "patch"
        ) {
          // @ts-ignores - this is callable
          controller[method](e.desc.route, ...mw, e.handler);
        }
      }

      // attach the controller to the feature
      feature.route(ctrl.desc.route, controller);
    }

    return feature;
  }
}
