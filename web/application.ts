import type { Ctr } from "@chojs/core/meta";
import type { ChoWebAdapter } from "./adapter.ts";
import type { CompiledModule } from "@chojs/core/compiler";
import { Compiler } from "@chojs/core/compiler";
import { Linker } from "./linker.ts";

export type ApplicationOptions = {
  adapter: ChoWebAdapter;
};

export class Application<AppRef> {
  /**
   * Create an application instance by compiling the feature and linking it with the adapter.
   * @param feature
   * @param options
   */
  static async create<T>(
    feature: Ctr,
    options?: ApplicationOptions,
  ): Promise<Application<T>> {
    let adapter = options?.adapter;
    if (!adapter) {
      try {
        const { HonoAdapter } = await import("@chojs/vendor-hono");
        adapter = new HonoAdapter();
      } catch {
        throw new Error(
          "Adapter is required. Please provide an adapter or install @chojs/vendor-hono.",
        );
      }
    }
    const compiled = await new Compiler().compile(feature);
    const linked = new Linker(adapter).link(compiled);
    return new Application(compiled, linked as T, adapter);
  }

  constructor(
    readonly instance: CompiledModule,
    readonly appRef: AppRef,
    readonly adapter: ChoWebAdapter,
  ) {
  }
}
