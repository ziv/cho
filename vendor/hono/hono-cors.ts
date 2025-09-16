// import { Context } from "hono";
// import { cors as honoCors } from "hono/cors";
// import type { Context as WebContext, Middleware, Next } from "@chojs/web/interfaces";
//
// // taken from
// type CORSOptions = {
//   origin:
//     | string
//     | string[]
//     | ((
//       origin: string,
//       c: Context,
//     ) => Promise<string | undefined | null> | string | undefined | null);
//   allowMethods?: string[] | ((origin: string, c: Context) => Promise<string[]> | string[]);
//   allowHeaders?: string[];
//   maxAge?: number;
//   credentials?: boolean;
//   exposeHeaders?: string[];
// };
//
// export function cors(opt?: CORSOptions): Middleware {
//   return (ctx: WebContext, next: Next) => honoCors(opt)(ctx, next);
// }
