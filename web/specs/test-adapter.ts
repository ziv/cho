import { Adapter, Middleware } from "../interfaces/mod.ts";
import { Any } from "../../core/meta/mod.ts";

export class TestAdapter implements Adapter {
  createContext(raw: Any) {
    return raw;
  }

  createMiddleware(middleware: Any) {
    return middleware;
  }

  createController(middlewares: Any[]) {
    return { middlewares };
  }

  createFeature(middlewares: Any[]) {
    return { middlewares };
  }

  mountEndpoint(
    ctr: Any,
    mws: Any[],
    endpoint: Any,
    route: string,
    httpMethod: string,
  ) {
  }
}
