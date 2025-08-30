import type { Context } from "@oak/oak";
import { ChoContext } from "../cho/context.ts";

/**
 * OakContext is a wrapper around Oak's Context to provide a unified interface.
 */
export class OakContext extends ChoContext<Context> {
  constructor(readonly raw: Context) {
    super();
  }

  override rawContext() {
    return this.raw;
  }

  override status(code: number): this {
    this.raw.response.status = code;
    return this;
  }

  override param(key: string): string | undefined {
    return raw.param[key];
  }

  override body<T = unknown>(): Promise<T> {
    return Promise.resolve(undefined);
  }

  override query(key?: string): URLSearchParams | string | undefined {
    return key ? this.raw.request.url.searchParams.get(key) : this.raw.request.url.searchParams;
  }

  override queries(key: string): string[] {
    return this.raw.request.url.searchParams.getAll(key);
  }

  override header(key: string): string | undefined {
    return this.raw.request.headers.get(key);
  }

  override json<T>(): Promise<T> {
    return this.raw.request.json() as Promise<T>;
  }
}
