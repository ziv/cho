import { Any } from  "@chojs/core/di";
import { ChoFeatureDescriptor } from "./types.ts";

export abstract class ChoWebLinker {
  /**
   * Create the web application
   * @param descriptor
   */
  abstract link(descriptor: ChoFeatureDescriptor): boolean;

  /**
   * Get the application request handler
   */
  abstract handler(): (req: Request) => Promise<Response> | Response;

  /**
   * Get a reference to the underlying application instance
   */
  abstract ref(): Any;
}
