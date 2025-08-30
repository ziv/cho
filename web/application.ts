import type { ChoLinker } from "@chojs/vendor";
import type { Any, Ctr } from "@chojs/core/di";
import { debuglog } from "@chojs/core/utils";
import { Compiler } from "./compiler.ts";

export type ChoWebApplicationOptions = {
  linker: ChoLinker;
};

const log = debuglog("web:application");

export class ApplicationRef<T = Any> {
  constructor(protected readonly link: ChoLinker) {
  }

  handler(): (request: Request) => Promise<Response> {
    return this.link.handler();
  }

  ref(): T {
    return this.link.ref() as T;
  }
}

export async function createApplication<T>(
  app: Ctr,
  options: Partial<ChoWebApplicationOptions> = {},
): Promise<ApplicationRef<T>> {
  if (!options.linker) {
    try {
      log("no linker provided, trying to load @chojs/vendor and use OakLinker as default");
      const vendor = await import("@chojs/vendor");
      options.linker = new vendor.OakLinker();
    } catch (e) {
      log.error(e);
      throw new Error("no linker provided and @chojs/vendor not installed");
    }
  }

  log("linking application");
  const compiled = await new Compiler().compile(app);
  options.linker.link(compiled);

  return new ApplicationRef<T>(options.linker);
}
