export abstract class ChoContext<Ctx> {
  abstract rawContext(): Ctx;

  // request handlers

  /**
   * Get a path parameter by key.
   * @param key
   */
  abstract param(key: string): string | undefined;

  /**
   * Get a query parameter or all query parameters.
   * @param key
   */
  abstract query(key?: string): URLSearchParams | string | undefined;

  /**
   * Get query parameters as an array of strings for a given key.
   * @param key
   */
  abstract queries(key: string): string[];

  /**
   * Get a header value by key.
   */
  abstract header(key: string): string | undefined;

  /**
   * Get the request body parsed as JSON.
   */
  abstract json<T>(): Promise<T>;

  // response handlers

  /**
   * Set the HTTP status code for the response.
   * @param code
   */
  abstract status(code: number): this;
}
