export class InvalidInputError extends Error {
  constructor(readonly description: unknown, reason: string) {
    super(reason);
  }
}

export class NotMiddlewareError extends Error {
  constructor(readonly input: unknown) {
    super("the middleware is not a class or a function");
  }
}

export class NotControllerError extends Error {
  constructor(readonly input: unknown) {
    super("the controller is not a class");
  }
}

export class NotFeatureError extends Error {
  constructor(readonly input: unknown) {
    super("the feature is not a class");
  }
}

export class EmptyControllerError extends Error {
  constructor(readonly input: unknown) {
    super("the controller has no endpoints");
  }
}

export class UnauthorizedError extends Error {
}
