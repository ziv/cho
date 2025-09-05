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
  raw(): Ctx;

  /**
   * Get the raw request object from the underlying framework.
   */
  rawRequest(): Req;

  /**
   * Get the raw response object from the underlying framework.
   */
  rawResponse(): Res;

  // input handler

  /**
   * Get path parameters or a specific path parameter by key.
   * @param key
   */
  param(key?: string): ParamsType<string>;

  /**
   * Get query parameters or a specific query parameter by key.
   * @param key
   */
  query(key?: string): ParamsType<string | string[]>;

  /**
   * Get header parameters or a specific header parameter by key.
   * @param key
   */
  header(key?: string): ParamsType<string | string[]>;

  /**
   * Get cookie parameters or a specific cookie parameter by key.
   * @param key
   */
  cookie(key?: string): ParamsType<string>;

  /**
   * Get the request body parsed as JSON.
   */
  json<T>(): Promise<T>;

  body<T>(): Promise<T>;
}
