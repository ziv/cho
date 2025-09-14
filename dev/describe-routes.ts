import { green } from "@std/fmt/colors";
import type { CompiledFeature } from "@chojs/web";

/**
 * Describe all routes in a compiled feature.
 * @param input
 */
export function describeRoutes(input: CompiledFeature): void {
  function describeFeature(feature: CompiledFeature, depth = 0) {
    for (const c of feature.controllers) {
      for (const m of c.methods) {
        const parts = [feature.route, c.route, m.route].filter(Boolean).join("/");
        console.log(
          green(m.type),
          `/${parts}`,
        );
      }
    }
    for (const f of feature.features) {
      describeFeature(f, depth + 1);
    }
  }

  describeFeature(input, 0);
}
