import type { Context as WebContext } from "@chojs/web";
import type { Context } from "hono";

/**
 * HonoContext is a wrapper around Hono's Context to provide a unified interface.
 */
export class HonoContext implements WebContext<Context> {
  constructor(readonly raw: Context) {
  }

  rawCtx(): Context {
    return this.raw;
  }

  rawRequest(): Request {
    return this.raw.req.raw as Request;
  }

  rawResponse(): Response {
    return this.raw.res as Response;
  }

  // input handlers

  params(): Record<string, string> {
    return this.raw.req.param();
  }

  query(): Record<string, string | string[]> {
    return this.raw.req.query();
  }

  headers(): Record<string, string | string[]> {
    return this.raw.req.header();
  }

  jsonBody<T>(): Promise<T> {
    return this.raw.req.json() as Promise<T>;
  }

  // response handlers

  json(data: any): Response {
    return this.raw.json(data);
  }
}
