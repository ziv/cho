import { cors as honoCors } from "hono/cors";
import type { Context as WebContext, Next } from "@chojs/web";

type CORSOptions = {
  origin:
    | string
    | string[]
    | ((
      origin: string,
      c: Context,
    ) => Promise<string | undefined | null> | string | undefined | null);
  allowMethods?: string[] | ((origin: string, c: Context) => Promise<string[]> | string[]);
  allowHeaders?: string[];
  maxAge?: number;
  credentials?: boolean;
  exposeHeaders?: string[];
};

export function cors(opt?: CORSOptions) {
  return (ctx: WebContext, next: Next) => honoCors(opt)(ctx.rawCtx(), next);
}
