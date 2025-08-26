import type { FeatureRef } from "./refs.ts";

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

  // extend HTTP server

  // not abstract as not all web frameworks support them

  /**
   * Upgrade the HTTP server to handle WebSocket connections
   */
  upgradeWebsocket(handler: (ws: WebSocket) => void) {
    throw new Error("Method not implemented.");
  }

  /**
   * Upgrade the HTTP server to handle WebTransport connections
   */
  upgradeStream() {
    throw new Error("Method not implemented.");
  }

  /**
   * Upgrade the HTTP server to handle Server-Sent Events (SSE) connections
   */
  upgradeSSE() {
    throw new Error("Method not implemented.");
  }
}
