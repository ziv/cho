import { LinkedFeature } from "./types.ts";
import { Adapter } from "./adapter.ts";

export function linker<App>(root: LinkedFeature, adapter: Adapter): App {
  const toMiddleware = adapter.createMiddleware.bind(adapter);

  function process(ref: LinkedFeature) {
    const feature = adapter.createFeature(ref.middlewares.map(toMiddleware));

    // controllers
    for (const c of ref.controllers) {
      const controller = adapter.createController(c.middlewares.map(toMiddleware));

      // endpoints
      for (const e of c.methods) {
        const type = e.type.toLocaleLowerCase();
        let endpoint;
        if (type === "stream") {
          endpoint = adapter.createStreamEndpoint(e.handler, e.args);
        } else if (type === "sse") {
          endpoint = adapter.createSseEndpoint(e.handler, e.args);
        } else {
          endpoint = adapter.createEndpoint(e.handler, e.args);
        }
        adapter.mountEndpoint(
          controller,
          e.middlewares.map(toMiddleware),
          endpoint,
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

  return adapter.mountApp<App>(process(root), root.route);
}

// convert linker to class to support extensions for more than HTTP protocols

export interface LinkerPlugin {
}
export class HttpLinker implements LinkerPlugin {
}

export class Linker<App> {
  constructor(private readonly plugins: LinkerPlugin[]) {
  }
}
