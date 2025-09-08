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

  // request section

  /**
   * Get the request URL
   */
  url(): URL;

  /**
   * Get the request method
   */
  method(): string;

  /**
   * Set a local value that can be shared within the request lifecycle.
   * @param key
   * @param value
   */
  setLocal(key: string, value: unknown): this;

  /**
   * Get a local value that was set within the request lifecycle.
   * @param key
   */
  getLocal<T = unknown>(key: string): T | undefined;

  /**
   * Get all path parameters as a record object or a specific parameter by key.
   */
  params(key: string): string | undefined;
  params(): Record<string, string>;

  /**
   * Get query parameters as a record object or a specific parameter by key.
   */
  query(key: string): string | undefined;
  query(): Record<string, string>;

  /**
   * Get all query parameters lists as a record object or a specific parameter by key.
   * @param key
   */
  queries(key: string): string[] | undefined;
  queries(): Record<string, string[]>;

  /**
   * Get headers as a record object or a specific header by key.
   */
  headers(key: string): string | undefined;
  headers(): Record<string, string>;

  /**
   * Get the request body parsed as JSON.
   */
  jsonBody<T>(): Promise<T>;

  /**
   * Get the request body as blob.
   */
  blobBody(): Promise<Blob>;

  /**
   * Get the request body as text.
   */
  textBody(): Promise<string>;

  /**
   * Get the request body parsed as form data.
   */
  formBody(): Promise<FormData>;

  // response section

  /**
   * Set the response status code.
   * @param code
   */
  status(code: number): this;

  /**
   * Set a response header.
   * @param key
   * @param value
   */
  header(key: string, value: string): this;

  /**
   * Send a JSON response.
   * @param data
   */
  json(data: unknown): Promise<Response> | Response;

  /**
   * Send a text response.
   * @param data
   */
  text(data: string): Promise<Response> | Response;

  /**
   * Send an HTML response.
   * @param data
   */
  html(data: string): Promise<Response> | Response;

  /**
   * Send a 404 Not Found response.
   */
  notFound(): Promise<Response> | Response;

  /**
   * Send a redirect response.
   * @param url
   * @param code default to 302
   */
  redirect(url: string, code?: number): Promise<Response> | Response;
}
