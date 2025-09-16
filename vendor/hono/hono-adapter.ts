import type {Any, Target} from "@chojs/core";
import {Adapter, Context, Endpoint, Next, SseAdapter, StreamAdapter, TextStreamAdapter,} from "@chojs/web/interfaces";
import {type Context as RawContext, Hono, type MiddlewareHandler} from "hono";
import {stream, streamSSE, streamText} from "hono/streaming";
import {createMiddleware} from "hono/factory";

export class HonoAdapter implements
  SseAdapter,
  StreamAdapter,
  TextStreamAdapter,
  Adapter<
    Hono,
    Hono,
    Hono,
    Target,
    RawContext
  > {
  // Adapter

  createContext(raw: RawContext): Context {
    return raw as Context;
  }

  mountEndpoint(
    ctr: Hono,
    middlewares: MiddlewareHandler[],
    endpoint: MiddlewareHandler,
    route: string,
    httpMethod: string,
  ): void {
    httpMethod = httpMethod.toLowerCase();
    switch (httpMethod) {
      case "post":
      case "put":
      case "delete":
      case "patch":
        ctr[httpMethod](route, ...middlewares, endpoint);
        break;
      case "get":
      default: // all non http methods are treated as get
        ctr.get(route, ...middlewares, endpoint);
        break;
    }
  }

  mountController(feat: Hono, controller: Hono, route: string): void {
    feat.route(route, controller);
  }

  mountFeature(to: Hono, feat: Hono, route: string): void {
    return this.mountController(to, feat, route);
  }

  mountApp<R = Hono>(feature: Hono, route: string): R {
    const app = new Hono();
    app.route(route, feature);
    return app as R;
  }

  createMiddleware(handler: (ctx: Context, next: Next) => void): Target {
    return createMiddleware(handler as Any);
  }

  createController(mws: MiddlewareHandler[]): Hono {
    const c = new Hono();
    for (const mw of mws) c.use(mw);
    return c;
  }

  createFeature(mws: MiddlewareHandler[]): Hono {
    const c = new Hono();
    for (const mw of mws) c.use(mw);
    return c;
  }

  // SseAdapter

  createSseEndpoint(handler: Target): Endpoint {
    return function (ctx: RawContext) {
      return streamSSE(ctx, (stream) => handler(ctx, stream));
    };
  }

  // StreamAdapter

  createStreamEndpoint(handler: Target): Endpoint {
    return function (ctx: RawContext) {
      return stream(ctx, (stream) => handler(ctx, stream));
    };
  }

  // TextStreamAdapter

  createTextStreamEndpoint(handler: Target): Endpoint {
    return function (ctx: RawContext) {
      return streamText(ctx, (stream) => handler(ctx, stream));
    };
  }
}
