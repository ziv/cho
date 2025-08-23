import { Any } from "../core/di/types.ts";
import { ProcessedFeature } from "./types.ts";

export default abstract class ChoWebLinker {
  /**
   * Create the web application
   * @param descriptor
   */
  abstract link(descriptor: ProcessedFeature): boolean;

  /**
   * Get the application request handler
   */
  abstract handler(): (req: Request) => Promise<Response> | Response;

  /**
   * Get a reference to the underlying application instance
   */
  abstract ref(): Any;
}
