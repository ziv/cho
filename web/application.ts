import ChoWebLinker from "./linker.ts";
import { Ctr } from "@chojs/core";
import { ChoWebBuilder } from "./builder.ts";
// import { showRoutes } from "hono/dev";

export class ChoWebApplication {
  static async create(
    feature: Ctr,
    linker: ChoWebLinker,
  ): Promise<ChoWebApplication> {
    const app = await new ChoWebBuilder().build(feature);
    linker.link(app);

    // todo remove later, for debugging only
    // showRoutes(linker.ref());
    return new ChoWebApplication(linker);
  }

  constructor(readonly linker: ChoWebLinker) {
  }
}
