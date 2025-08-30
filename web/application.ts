import { Ctr } from "@chojs/core";
import { ChoWebLinker } from "./linker.ts";
import { debuglog } from "@chojs/core/utils";
import { Any } from "@chojs/core/di";
import { Compiler } from "./compiler.ts";

export type ChoWebApplicationOptions<T = Any> = {
  linker: ChoWebLinker<T>;
};

const log = debuglog("web:application");

export class ApplicationRef<T = Any> {
  constructor(protected readonly link: ChoWebLinker<T>) {
  }

  handler() {
    return this.link.handler();
  }

  ref(): T {
    return this.link.ref() as T;
  }
}

export async function createApplication<T>(
  app: Ctr,
  options: Partial<ChoWebApplicationOptions<T>> = {},
): Promise<ApplicationRef<T>> {
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

  log("linking application");
  const compiled = await new Compiler().compile(app);
  options.linker.link(compiled);

  return new ApplicationRef<T>(options.linker);
}
