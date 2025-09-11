import type { Target } from "@chojs/core";
import { Adapter, Context, MethodArgFactory, Next, SseAdapter, StreamAdapter } from "@chojs/web";
import { type Context as RawContext, Hono, type MiddlewareHandler, type Next as RawNext } from "hono";
import { stream, streamSSE } from "hono/streaming";
import { createMiddleware } from "hono/factory";
import { HonoContext } from "./hono-context.ts";

export class HonoAdapter implements
  SseAdapter,
  StreamAdapter,
  Adapter<
    Hono,
    Hono,
    Hono,
    Target
  > {
  createMiddleware(handler: (ctx: Context, next: Next) => void): Target {
    return createMiddleware(async (c: RawContext, next: RawNext) => {
      return handler(new HonoContext(c), next);
    });
  }

  createEndpoint(handler: Target, factory: MethodArgFactory): Target {
    return async function (c: RawContext) {
      const ctx = new HonoContext(c);
      const args = await factory(ctx);
      const ret = await handler(...args, ctx);
      if (ret instanceof Response) {
        return ret;
      }
      return c.json(ret);
    } as MiddlewareHandler;
  }

  createStreamEndpoint(handler: Target, factory: MethodArgFactory): Target {
    return function (c: RawContext) {
      return stream(c, async (stream) => {
        const ctx = new HonoContext(c);
        const args = await factory(ctx);
        await handler(...args, stream, ctx);
        // for await (const next of handler(...args, stream, ctx)) {
        //   await stream.write(next);
        // }
        // stream.close();
      });
    };
  }

  createSseEndpoint(handler: Target, factory: MethodArgFactory): Target {
    return function (c: RawContext) {
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
    const c = new Hono();
    for (const mw of mws) c.use(mw);
    return c;
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
