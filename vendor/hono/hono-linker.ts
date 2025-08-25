import { Hono } from "hono";
import { ChoWebLinker, FeatureRef } from "@chojs/web";

export default class HonoLinker extends ChoWebLinker<Hono> {
  app!: Hono;

  /**
   * Get a reference to the underlying application instance
   * Reference type is Hono
   */
  override ref() {
    return this.app;
  }

  /**
   * Get the application request handler
   */
  override handler() {
    return this.app.fetch;
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
      feature.use(mw);
    }

    // link sub-features
    for (const feat of desc.features) {
      feature.route(feat.route, this.attach(feat));
    }

    // link controllers
    for (const ctrl of desc.controllers) {
      const controller = new Hono();

      // link middlewares
      for (const mw of ctrl.middlewares) {
        controller.use(mw);
      }

      // link methods with their middlewares
      for (const e of ctrl.methods) {
        const method = e.desc.method.toLowerCase() as keyof Hono;
        const mw = e.middlewares || [];
        controller[method](e.desc.route, ...mw, e.handler);
      }

      // attach the controller to the feature
      feature.route(ctrl.desc.route, controller);
    }

    return feature;
  }
}
