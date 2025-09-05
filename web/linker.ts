import { LinkedFeature } from "./types.ts";
import { Adapter } from "./adapter.ts";

export default function linker(root: LinkedFeature, adapter: Adapter) {
  const toMiddleware = adapter.createMiddleware.bind(adapter);

  function process(ref: LinkedFeature) {
    const feature = adapter.createFeature(ref.middlewares.map(toMiddleware));

    // controllers
    for (const c of ref.controllers) {
      const controller = adapter.createController(c.middlewares.map(toMiddleware));

      // endpoints
      for (const e of c.methods) {
        adapter.mountEndpoint(
          controller,
          e.middlewares.map(toMiddleware),
          adapter.createEndpoint(e.handler, e.args),
          e.route,
          e.type,
        );
      }
      adapter.mountController(feature, controller, c.route);
    }

    // sub-features
    for (const f of ref.features) {
      adapter.mountFeature(feature, process(f), f.route);
    }

    return feature;
  }

  return adapter.mountApp(process(root));
}
