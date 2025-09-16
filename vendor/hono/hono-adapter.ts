import type { Any, Target } from "@chojs/core";
import { type Context, Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { stream, streamSSE, streamText } from "hono/streaming";
import { ChoErrorHandlerFn, ChoMiddlewareFn } from "../../core/di/types.ts";
import { ChoWebAdapter } from "../../web/adapter.ts";
import { ChoWebContext } from "../../web/context.ts";

/**
 * Cho adapter for Hono framework
 * @see https://hono.dev
 */
export class HonoAdapter implements
  ChoWebAdapter<
    Hono,
    Hono,
    Hono,
    Target,
    Target,
    RawContext
  > {
  createContext(
    raw: Context,
  ): ChoWebContext {
    // Hono's context is already well-typed, so we can directly cast it
    return raw as ChoWebContext;
  }

  createMiddleware(
    middleware: ChoMiddlewareFn,
  ): Target {
    return createMiddleware(handler as Any);
  }

  createEndpoint(
    endpoint: ChoEndpointFn,
    errorHandler?: ChoErrorHandlerFn,
  ): Target {
    if (!errorHandler) {
      return endpoint;
    }
    return async function (...args: unknown[]) {
      try {
        return await endpoint(...args);
      } catch (err) {
        const ctx = args.pop();
        return errorHandler(err, ctx);
      }
    };
  }

  createController(
    middlewares: Target[],
    errorHandler?: ChoErrorHandlerFn,
  ): Hono {
    const c = new Hono();
    for (const mw of middlewares) {
      c.use(mw);
    }
    if (errorHandler) {
      c.onError(errorHandler);
    }
    return c;
  }

  createFeature(
    middlewares: Target[],
    errorHandler?: ChoErrorHandlerFn,
  ): Hono {
    const c = new Hono();
    for (const mw of middlewares) {
      c.use(mw);
    }
    if (errorHandler) {
      c.onError(errorHandler);
    }
    return c;
  }

  mountEndpoint(
    ctr: Hono,
    middlewares: Target[],
    endpoint: Target,
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

  mountApp<R = Hono>(feature: Hono, route: string): R {
    const app = new Hono();
    app.route(route, feature);
    return app as R;
  }

  mountController(feat: Hono, controller: Hono, route: string): void {
    feat.route(route, controller);
  }

  mountFeature(to: Hono, feat: Hono, route: string): void {
    return this.mountController(to, feat, route);
  }

  // extended HTTP methods

  // SseAdapter

  createSseEndpoint(handler: ChoEndpointFn): Target {
    return function (ctx: RawContext) {
      return streamSSE(ctx, (stream) => handler(ctx, stream));
    };
  }

  // StreamAdapter

  createStreamEndpoint(handler: ChoEndpointFn): Target {
    return function (ctx: RawContext) {
      return stream(ctx, (stream) => handler(ctx, stream));
    };
  }

  // TextStreamAdapter

  createTextStreamEndpoint(handler: ChoEndpointFn): Target {
    return function (ctx: RawContext) {
      return streamText(ctx, (stream) => handler(ctx, stream));
    };
  }
}
