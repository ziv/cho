import type { LinkedFeature } from "./types.ts";

/**
 * Abstract Web Linker class
 * Used as base class for linking a web application framework to Cho.js
 *
 * @abstract
 */
export interface ChoLinker {
  /**
   * Get a reference to the underlying application instance
   *
   * @return Router> The application instance
   */
  ref<T>(): T;

  /**
   * Get the application request handlers
   *
   * @return {(request: Request) => Promise<Response>} The request handler
   */
  handler(): (request: Request) => Promise<Response>;

  /**
   * Create the web application
   * @param ref
   * @return {boolean} true if successful
   */
  link(ref: LinkedFeature): boolean;
}
