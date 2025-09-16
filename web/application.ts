import type { Ctr } from "@chojs/core/meta";
import type { Adapter } from "./interfaces/mod.ts";
import { CompiledFeature, Compiler } from "./compiler.ts";
import { Linker } from "./linker.ts";

export class Application<AppRef> {
  /**
   * Create an application instance by compiling the feature and linking it with the adapter.
   * @param feature
   * @param adapter
   */
  static async create(feature: Ctr, adapter?: Adapter) {
    if (!adapter) {
      try {
        const { HonoAdapter } = await import("@chojs/vendor-hono");
        adapter = new HonoAdapter();
      } catch {
        throw new Error("Adapter is required. Please provide an adapter or install @chojs/vendor-hono.");
      }
    }
    const compiled = await new Compiler().compile(feature);
    const linked = new Linker(adapter).link(compiled);
    return new Application(compiled, linked as AppRef, adapter);
  }

  constructor(
    readonly instance: CompiledFeature,
    readonly appRef: AppRef,
    readonly adapter: Adapter,
  ) {
  }
}
