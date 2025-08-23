import {Hono} from "hono";
import {ChoWebLinker} from "@cho/web/linker.ts";
import {debuglog} from "@cho/core/utils";
import {ChoFeatureDescriptor} from "../../web/types.ts";

const log = debuglog("HonorAdapter");

export default class HonoLinker extends ChoWebLinker {
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
   * @param descriptor
   */
  override link(descriptor: ChoFeatureDescriptor): boolean {
    this.app = this.attach(descriptor);
    return true;
  }

  private attach(feature: ChoFeatureDescriptor): Hono {
    log(`Creating feature: "${feature.route || "/"}"`);
    const feat = new Hono();
    // recursively attach features
    for (const f of feature.features) {
      log(`Attaching feature: ${f.route}`);
      feat.route(
        f.route,
        this.attach(f),
      );
    }
    // link controllers
    for (const c of feature.controllers) {
      log(`Linking controller: /${c.route}`);
      const controller = new Hono();
      for (const e of c.methods) {
        const m = e.method.toLowerCase();
        if (
          // todo complete with all methods
          m === "get" ||
          m === "post" ||
          m === "put" ||
          m === "delete" ||
          m === "patch"
        ) {
          log(`Link: ${e.method.toUpperCase()} /${c.route}/${e.route}`);
          // make sure the method keep its context
          const f = c.controller[e.name].bind(c.controller);
          // create the handler
          controller[m](e.route, f);
        }
      }
      // mount controller to feature
      feat.route(c.route, controller);
    }
    return feat;
  }
}
