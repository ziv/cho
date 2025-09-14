import type { Context } from "./context.ts";
import type { Next } from "./adapter.ts";

/**
 * Interface for middleware classes that can process requests.
 * Middleware must implement handle method to process the request context.
 */
export interface ChoMiddleware {
  handle(ctx: Context, next: Next): Promise<void>;
}
