import type { Context as WebContext } from "@chojs/web";
import type { Context } from "hono";

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
    return new URL(this.raw.req.url);
  }

  method(): string {
    return this.raw.req.method;
  }

  setLocal(key: string, value: unknown): this {
    this.raw.set(key, value);
    return this;
  }

  getLocal<T = unknown>(key: string): T | undefined {
    return this.raw.get(key) as T | undefined;
  }

  params(key: string): string | undefined;
  params(): Record<string, string>;
  params(key?: string): RequestItem {
    return key ? this.raw.req.param(key) : this.raw.req.param();
  }

  query(key: string): string | undefined;
  query(): Record<string, string>;
  query(key?: string): RequestItem {
    return key ? this.raw.req.query(key) : this.raw.req.query();
  }

  queries(key: string): string[] | undefined;
  queries(): Record<string, string[]>;
  queries(key?: string): RequestItem<string[]> {
    return key ? this.raw.req.queries(key) : this.raw.req.queries();
  }

  headers(key: string): string | undefined;
  headers(): Record<string, string>;
  headers(key?: string): RequestItem {
    return key ? this.raw.req.header(key) : this.raw.req.header();
  }

  // rawBody(): Promise<Uint8Array> {
  //   // new Uint8Array();
  //   return this.raw.req.arrayBuffer() as Promise<Uint8Array>;
  // }

  jsonBody<T>(): Promise<T> {
    return this.raw.req.json() as Promise<T>;
  }

  blobBody(): Promise<Blob> {
    return this.raw.req.blob();
  }

  textBody<T = Uint8Array>(): Promise<T> {
    // todo complete
    // return this.raw.req.text().then((text) => new Response(text));
    return Promise.resolve(new Uint8Array() as T);
  }

  formBody(): Promise<FormData> {
    // todo complete
    return Promise.resolve(new FormData());
  }

  // response part

  status(status: number): this {
    this.raw.status(status as any);
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

  notFound(message = "Not Found"): Response {
    return new Response(message, {
      status: 404,
    });
  }

  redirect(url: string, code = 302): Response {
    return this.raw.redirect(url, code as any);
  }
}
