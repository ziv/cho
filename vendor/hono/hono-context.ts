import type { Context, StatusCode } from "./deps.ts";
import { ChoContext } from "../context.ts";

/**
 * HonoContext is a wrapper around Hono's Context to provide a unified interface.
 */
export class HonoContext implements ChoContext<Context> {
  constructor(readonly raw: Context) {
  }

  rawContext() {
    return this.raw;
  }

  status(code: number): this {
    this.raw.status(code as StatusCode);
    return this;
  }

  param(key: string): string | undefined {
    return this.raw.req.param(key);
  }

  query(key?: string): URLSearchParams | string | Record<string, string> | null {
    return (key ? this.raw.req.query(key) : this.raw.req.query()) ?? null;
  }

  queries(key: string): string[] {
    return this.raw.req.queries(key) ?? [];
  }

  header(key: string): string | null {
    return this.raw.header(key) ?? null;
  }

  json<T>(): Promise<T> {
    return this.raw.req.json() as Promise<T>;
  }
}
