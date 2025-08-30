import type { Context } from "@oak/oak";
import { ChoContext } from "../context.ts";

/**
 * OakContext is a wrapper around Oak's Context to provide a unified interface.
 */
export class OakContext implements ChoContext<Context> {
  constructor(readonly raw: Context) {
    super();
  }

  rawContext() {
    return this.raw;
  }

  status(code: number): this {
    this.raw.response.status = code;
    return this;
  }

  param(key: string): string | undefined {
    return raw.param[key];
  }

  body<T = unknown>(): Promise<T> {
    return Promise.resolve(undefined);
  }

  query(key?: string): URLSearchParams | string | undefined {
    return key ? this.raw.request.url.searchParams.get(key) : this.raw.request.url.searchParams;
  }

  queries(key: string): string[] {
    return this.raw.request.url.searchParams.getAll(key);
  }

  header(key: string): string | undefined {
    return this.raw.request.headers.get(key);
  }

  json<T>(): Promise<T> {
    return this.raw.request.json() as Promise<T>;
  }
}
