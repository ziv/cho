import type { Context } from "./context.ts";

/**
 * Injectable service interface to define as a class level error handler.
 * Classes implement the `ErrorHandler` used with `@Catch` decorator.
 *
 * @example usage:
 * ```ts
 * @Catch(MyErrorHandler)
 * @Controller("my")
 * class MyController {
 *   @Get("items")
 *   getItems() { }
 * }
 * ```
 */
export interface ErrorHandler {
  catch(err: unknown, ctx: Context): void | Promise<void>;
}
