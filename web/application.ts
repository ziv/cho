import { Ctr } from "@chojs/core";
import { ChoWebLinker } from "./linker.ts";
import { buildRef } from "./builder.ts";
import { ApplicationRef } from "./refs.ts";
import { debuglog } from "@chojs/core/utils";
import { Any } from "@chojs/core/di";

export type ChoWebApplicationOptions = {
  linker: ChoWebLinker<Any>;
};

const log = debuglog("web:application");

export class ChoWebApplication {
  /**
   * Create and link a web application
   * @param app The application class
   * @param options
   * @return {ApplicationRef} The web application instance
   */
  static async create(
    app: Ctr,
    options: Partial<ChoWebApplicationOptions> = {},
  ): Promise<ApplicationRef> {
    if (!options.linker) {
      try {
        log("no linker provided, trying to load @chojs/vendor and use HonoLinker");
        const vendor = await import("@chojs/vendor");
        options.linker = new vendor.HonoLinker();
      } catch (e) {
        log.error(e);
        throw new Error("no linker provided and @chojs/vendor not installed");
      }
    }

    log("building application");
    const ref = await buildRef(app);

    log("linking application");
    options.linker.link(ref);

    return new ApplicationRef(options.linker, ref);
  }
}
