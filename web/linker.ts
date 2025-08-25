import type {FeatureRef} from "./refs.ts";

/**
 * Abstract Web Linker class
 * Used as base class for linking a web application framework to Cho.js
 *
 * @abstract
 */
export abstract class ChoWebLinker<Router> {
  /**
   * Get a reference to the underlying application instance
   *
   * @return {Router} The application instance
   */
  abstract ref(): Router;

  /**
   * Get the application request handlers
   *
   * @return {(request: Request) => Promise<Response>} The request handler
   */
  abstract handler(): (request: Request) => Promise<Response>;

  /**
   * Create the web application
   * @param ref
   * @return {boolean} true if successful
   */
  abstract link(ref: FeatureRef): boolean;
}
