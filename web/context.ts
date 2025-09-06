export type ParamsType<S> = Record<string, S> | string | undefined;

/**
 * Context is an ion over different web frameworks to provide a unified interface.
 */
export interface Context<
  Ctx extends any = any,
  Req = Request,
  Res = Response,
> {
  // raw section
  /**
   * Get the raw context object from the underlying framework.
   */
  rawCtx(): Ctx;

  /**
   * Get the raw request object from the underlying framework.
   */
  rawRequest(): Req;

  /**
   * Get the raw response object from the underlying framework.
   */
  rawResponse(): Res;

  // request input getters

  /**
   * Get all path parameters as a record.
   */
  params(): Record<string, string>;

  /**
   * Get query parameters
   */
  query(): Record<string, string | string[]>;

  /**
   * Get headers
   */
  headers(): Record<string, string | string[]>;

  // body handlers

  /**
   * Get the request body parsed as JSON.
   */
  jsonBody<T>(): Promise<T>;

  // response handlers

  /**
   * Send a JSON response.
   * @param data
   */
  json(data: unknown): Response;
}
