import type { Any, Target } from "@chojs/core";
import type { ChoContext } from "./context.ts";

export { ChoContext };

export type Next = () => void | Promise<void>;
export type Middleware<T = Any> = (ctx: ChoContext<T>, next: Next) => void | Promise<void>;

export type MethodType =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "OPTIONS"
  | "HEAD"
  | "SSE"
  | "SSEIT"
  | "WS"
  | "STREAM";

export type Linked<T> = T & { route: string; middlewares: Middleware[] };
export type LinkedMethod = Linked<{ handler: Target; type: MethodType }>;
export type LinkedController = Linked<{ methods: LinkedMethod[] }>;
export type LinkedFeature = Linked<{ controllers: LinkedController[]; features: LinkedFeature[] }>;
