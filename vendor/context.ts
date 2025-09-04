export interface ChoContext<Ctx extends any = any> {
  rawContext(): Ctx;

  // request handlers

  /**
   * Get a path parameter by key.
   * @param key
   */
  param(key: string): string | undefined;

  /**
   * Get a query parameter or all query parameters.
   * @param key
   */
  query(key?: string): URLSearchParams | string | Record<string, string> | null;

  /**
   * Get query parameters as an array of strings for a given key.
   * @param key
   */
  queries(key: string): string[];

  /**
   * Get a header value by key.
   */
  header(key: string): string | null;

  /**
   * Get the request body parsed as JSON.
   */
  json<T>(): Promise<T>;

  // response handlers

  /**
   * Set the HTTP status code for the response.
   * @param code
   */
  status(code: number): this;
}
