/**
 * Error thrown when input validation fails.
 */
export class InvalidInputError extends Error {
  constructor(readonly description: unknown, reason: string) {
    super(reason);
  }
}

/**
 * Error thrown when a provided middleware is not a valid class or function.
 */
export class NotMiddlewareError extends Error {
  constructor(readonly input: unknown) {
    super("the middleware is not a class or a function");
  }
}

/**
 * Error thrown when a provided controller is not a valid class.
 */
export class NotControllerError extends Error {
  constructor(readonly input: unknown) {
    super("the class is not a controller");
  }
}

/**
 * Error thrown when a provided feature is not a valid class.
 */
export class NotFeatureError extends Error {
  constructor(readonly input: unknown) {
    super("the class is not a feature");
  }
}

/**
 * Error thrown when a controller has no defined endpoints.
 */
export class EmptyControllerError extends Error {
  constructor(readonly input: unknown) {
    super("the controller has no endpoints");
  }
}

/**
 * Error thrown when access is denied by a guard.
 */
export class UnauthorizedError extends Error {
}

export class CircularDependencyError extends Error {
}
