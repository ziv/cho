import { Context, Hono } from "hono";
import ChoWebLinker from "@cho/web/linker.ts";
import { ProcessedFeature } from "@cho/web/types.ts";
import debuglog from "@cho/core/debug.ts";

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
  override link(descriptor: ProcessedFeature): boolean {
    this.app = this.attach(descriptor);
    return true;
  }

  private attach(feature: ProcessedFeature): Hono {
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
      for (const e of c.endpoints) {
        const m = e.method.toLowerCase();
        if (
          // todo complete with all methods
          m === "get" ||
          m === "post" ||
          m === "put" ||
          m === "delete" ||
          m === "patch"
        ) {
          log(`Link endpoint: ${e.method.toUpperCase()} /${c.route}/${e.route}`);
          controller[m](
            e.route,
            (ctx: Context) => c.controller[e.name](ctx),
          );
        }
      }
      // mount controller to feature
      feat.route(c.route, controller);
    }
    return feat;
  }
}
