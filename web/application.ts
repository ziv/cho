import { Ctr } from "@chojs/core";
import { ChoWebLinker } from "./linker.ts";
import { build } from "./builder.ts";
import { buildRef } from "./builder-ref.ts";

export class ChoWebApplication {
  /**
   * Create and link a web application
   * @param app The application class
   * @param linker The web linker instance
   * @return {ChoWebApplication} The web application instance
   */
  static async create(
    app: Ctr,
    linker: ChoWebLinker<any>,
  ): Promise<ChoWebApplication> {
    const ref = await buildRef(build(app));
    linker.link(ref);
    return new ChoWebApplication(linker);
  }

  constructor(readonly link: ChoWebLinker<any>) {
  }
}
