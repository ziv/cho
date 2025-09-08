import type { Target } from "@chojs/core";
import { Adapter, Context, MethodArgFactory, Next } from "@chojs/web";
import { Hono, type MiddlewareHandler } from "hono";
import { stream, streamSSE } from "hono/streaming";
import { createMiddleware } from "hono/factory";
import { HonoContext } from "./hono-context.ts";

export class HonoAdapter implements
  Adapter<
    Hono,
    Hono,
    Hono,
    MiddlewareHandler
  > {
  createMiddleware(handler: (ctx: Context, next: Next) => void): MiddlewareHandler {
    return createMiddleware((c, next) => {
      return handler(new HonoContext(c), next);
    });
  }

  createEndpoint(handler: Target, factory: MethodArgFactory): MiddlewareHandler {
    return async function (c) {
      const ctx = new HonoContext(c);
      const args = [...(await factory(ctx)), ctx];
      const ret = await handler(...args);
      if (ret instanceof Response) return ret;
      return c.json(ret);
    } as MiddlewareHandler;
  }

  createStreamEndpoint(handler: Target, factory: MethodArgFactory): MiddlewareHandler {
    return function (c) {
      return stream(c, async (stream) => {
        const ctx = new HonoContext(c);
        const args = [...(await factory(ctx)), stream, ctx];
        await handler(...args);
      });
    };
  }

  createSseEndpoint(handler: Target, factory: MethodArgFactory): MiddlewareHandler {
    return function (c) {
      return streamSSE(c, async (stream) => {
        const ctx = new HonoContext(c);
        const args = [...(await factory(ctx)), ctx];
        for await (const next of handler(...args)) {
          await stream.writeSSE(next);
        }
        await stream.close();
      });
    };
  }

  createController(mws: MiddlewareHandler[]): Hono {
    const c = new Hono();
    for (const mw of mws) c.use(mw);
    return c;
  }

  createFeature(mws: MiddlewareHandler[]): Hono {
    return this.createController(mws);
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
      case "get":
      case "post":
      case "put":
      case "delete":
      case "patch":
        ctr[httpMethod](route, ...middlewares, endpoint);
        break;
      case "stream":
      case "sse":
        ctr.get(route, ...middlewares, endpoint);
        break;
      default:
        throw new Error(`Method type "${httpMethod}" not implemented yet in HonoAdapter`);
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
}
