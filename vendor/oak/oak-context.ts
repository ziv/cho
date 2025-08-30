import type { RouterContext } from "@oak/oak/router";
import type { ChoContext } from "../context.ts";
import { Any } from "@chojs/core/di";

/**
 * OakContext is a wrapper around Oak's Context to provide a unified interface.
 */
export class OakContext implements ChoContext<RouterContext<Any>> {
  constructor(readonly raw: RouterContext<Any>) {
  }

  rawContext() {
    return this.raw;
  }

  status(code: number): this {
    this.raw.response.status = code;
    return this;
  }

  param(key: string): string | undefined {
    return this.raw.params[key];
  }

  query(key?: string): URLSearchParams | string | Record<string, string> | null {
    return key ? this.raw.request.url.searchParams.get(key) : this.raw.request.url.searchParams;
  }

  queries(key: string): string[] {
    return this.raw.request.url.searchParams.getAll(key);
  }

  header(key: string): string | null {
    return this.raw.request.headers.get(key) ?? null;
  }

  json<T>(): Promise<T> {
    return this.raw.request.body.json() as Promise<T>;
  }
}
