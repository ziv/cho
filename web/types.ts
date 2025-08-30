import type { Context, Handler, MiddlewareHandler, Next } from "hono";

export type { Context, Handler, MiddlewareHandler, Next };

/**
 * A middleware must implement a `handle` method that takes any arguments
 */
export interface ChoMiddleware<C = Context, N = Next> {
  handle(ctx: C, next?: N): void | Promise<void>;
}

/**
 * A guard must implement a `canActivate` method that returns a boolean or Promise<boolean>
 */
export interface ChoGuard<C = Context, N = Next> {
  canActivate(ctx: C, next?: N): boolean | Promise<boolean>;
}
