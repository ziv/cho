import { FeatureRef } from "./builder-ref.ts";

export abstract class ChoWebLinker<Router> {
  /**
   * Get a reference to the underlying application instance
   */
  abstract ref(): Router;

  /**
   * Get the application request handlers
   */
  abstract handler(): (request: Request) => Promise<Response>;

  /**
   * Create the web application
   * @param ref
   */
  abstract link(ref: FeatureRef): boolean;
}
