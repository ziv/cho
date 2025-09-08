import type { Context as WebContext } from "@chojs/web";
import type { Context, RedirectStatusCode, StatusCode } from "hono";
import type { Any } from "@chojs/core/meta";

export type RequestItem<T = string> = Record<string, T> | T | undefined;

/**
 * HonoContext is a wrapper around Hono's Context to provide a unified interface.
 */
export class HonoContext implements WebContext<Context> {
  constructor(readonly raw: Context) {
  }

  // raw part

  rawCtx(): Context {
    return this.raw;
  }

  rawRequest(): Request {
    return this.raw.req.raw as Request;
  }

  rawResponse(): Response {
    return this.raw.res as Response;
  }

  // request part

  url(): URL {
    return new URL(this.raw.req.url());
  }

  method(): string {
    return this.raw.req.method();
  }

  setLocal(key: string, value: unknown): this {
    this.raw.set(key, value);
    return this;
  }

  getLocal<T = unknown>(key: string): T | undefined {
    return this.raw.get(key) as T | undefined;
  }

  params(key?: string): RequestItem {
    return this.raw.req.param(key);
  }

  query(key?: string): RequestItem {
    return this.raw.req.query(key);
  }

  queries(key?: string): RequestItem<string[]> {
    return this.raw.req.query(key);
  }

  headers(key?: string): RequestItem {
    return this.raw.req.header(key);
  }

  rawBody(): Promise<Uint8Array> {
    // new Uint8Array();
    return this.raw.req.arrayBuffer() as Promise<Uint8Array>;
  }

  jsonBody<T>(): Promise<T> {
    return this.raw.req.json() as Promise<T>;
  }

  blobBody(): Promise<Blob> {
    return this.raw.req.blob();
  }

  textBody<T = Uint8Array>(): Promise<T> {
    // return this.raw.req.text().then((text) => new Response(text));
    return Promise.resolve(new Uint8Array() as T);
  }

  // response part

  status(status: number): this {
    this.raw.status(status as StatusCode);
    return this;
  }

  header(key: string, value: string): this {
    this.raw.header(key, value);
    return this;
  }

  json(data: any): Response {
    return this.raw.json(data);
  }

  text(data: string): Response {
    return this.raw.text(data);
  }

  html(data: string): Response {
    return this.raw.html(data);
  }

  notFound(): Response {
    return new Response("Not Found", {
      status: 404,
    });
  }

  redirect(url: string, code = 302): Response {
    return this.raw.redirect(url, code as RedirectStatusCode);
  }
}
