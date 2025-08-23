import ChoWebLinker from "./linker.ts";
import { Ctr } from "../core/di/types.ts";
import ChoWebBuilder from "./builder.ts";
import HonoLinker from "./vendor/hono/hono-linker.ts";
import { showRoutes } from "hono/dev";

export type ChoWebApplicationOptions = {
  linker: ChoWebLinker;
};

export default class ChoWebApplication {
  static async create(
    app: Ctr,
    options: Partial<ChoWebApplicationOptions> = {},
  ): Promise<ChoWebApplication> {
    // todo create currently only hono is supported
    const linker = options.linker ?? new HonoLinker();
    const builder = new ChoWebBuilder();
    const feature = await builder.build(app);
    linker.link(feature);

    // todo remove later, for debugging only
    showRoutes(linker.ref());

    return new ChoWebApplication(linker);
  }

  constructor(readonly linker: ChoWebLinker) {
  }
}
