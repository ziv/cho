import type {Context} from "hono";
import {ChoContext} from "../context.ts";

/**
 * HonoContext is a wrapper around Hono's Context to provide a unified interface.
 */
export class HonoContext implements ChoContext<Context> {
  constructor(readonly raw: Context) {
    super();
  }

  override rawContext() {
    return this.raw;
  }

  override status(code: number): this {
    this.raw.status(code);
    return this;
  }

  override param(key: string): string | undefined {
    return this.raw.req.param(key);
  }

  override query(key?: string): URLSearchParams | string | undefined {
    return this.raw.req.query(key);
  }

  override queries(key: string): string[] {
    return this.raw.req.queries(key);
  }

  override header(key: string): string | undefined {
    return this.raw.header(key);
  }

  override json<T>(): Promise<T> {
    return this.raw.req.json() as Promise<T>;
  }
}
