import type { Context as WebContext } from "@chojs/web";
import type { Context } from "hono";

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

  url(): string {
    return this.raw.req.url();
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

  params(key?: string): Record<string, string> | string | undefined {
    return this.raw.req.param(key);
  }

  query(key?: string): Record<string, string | string[]> | string | string[] | undefined {
    return this.raw.req.query(key);
  }

  headers(key?: string): Record<string, string | string[]> | string | string[] | undefined {
    return this.raw.req.header(key);
  }

  rawBody(): Promise<Uint8Array> {
    return this.raw.req.arrayBuffer();
  }

  jsonBody<T>(): Promise<T> {
    return this.raw.req.json() as Promise<T>;
  }

  blobBody(): Promise<Blob> {
    return this.raw.req.blob();
  }

  textBody(): Promise<string> {
    return this.raw.req.text();
  }

  // response part

  status(status: number): this {
    this.raw.status(status);
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
    return this.raw.notFound();
  }

  redirect(url: string, code: number = 302): Response {
    return this.raw.redirect(url, code);
  }
}
