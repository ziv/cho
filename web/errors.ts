export class HttpError extends Error {
  constructor(
    public status: number,
    message?: string,
  ) {
    super(message ?? `HTTP Error ${status}`);
    this.name = "HttpError";
  }
}
