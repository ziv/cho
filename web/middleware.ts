export interface Middleware {
  handle(req: Request, res: Response, next: () => void): void;
}
