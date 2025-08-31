import type { Any, Ctr, DescriptorFn, Target, Token } from "@chojs/core/di";
import type { ChoContext, Middleware, Next } from "@chojs/vendor";
import type { FeatureMeta } from "./meta.ts";

export type Validator = {
  parse: (data: unknown) => Any;
};
export type ArgumentDescriptor = {
  type: "body" | "query" | "param" | "header" | "cookie";
  name?: string;
  validator?: Validator;
};

const isValidator = (v: unknown): v is Validator => {
  return typeof v === "object" && v !== null && "parse" in v && typeof (v as any).parse === "function";
};

const isString = (v: unknown): v is string => {
  return typeof v === "string";
};

export function createInputDescriptor(type: "body" | "query" | "param" | "header" | "cookie") {
  return (keyOrValidator?: string | Validator, validator?: Validator) => {
    if (!keyOrValidator && !validator) {
      // full object without validation
      return {
        type,
      };
    }

    // single argument cases

    if (!validator && isString(keyOrValidator)) {
      // partial without validation
      return {
        type,
        name: keyOrValidator,
      };
    }

    if (!validator && isValidator(keyOrValidator)) {
      // full object with validation
      return {
        type,
        validator: keyOrValidator,
      };
    }

    // two argument case

    if (isString(keyOrValidator) && isValidator(validator)) {
      // partial with validation
      return {
        type,
        name: keyOrValidator,
        validator: keyOrValidator,
      };
    }

    throw new Error(`Unknown input descriptor arguments for ${type}`);
  };
}

export const Param = createInputDescriptor("param");
export const Header = createInputDescriptor("header");
export const Cookie = createInputDescriptor("cookie");
export const Body = createInputDescriptor("body");

/**
 * Query parameter input descriptor
 * Can be used to define query parameters for a controllers method.
 *
 * @example Usage get all query params as object
 *
 * ```ts
 * class Controller {
 *
 * 〇Get("route",
 *  Args(
 *      Query(optionalValidator)
 *   )
 * )
 * getItems(query, ctx) {
 *     // ...
 *   }
 * }
 * ```
 *
 * @example Usage get specific query param by name
 *
 * ```ts
 * class Controller {
 *
 * 〇Get("route",
 *  Args(
 *      Query("id", optionalValidator)
 *   )
 * )
 * getItems(id, ctx) {
 *     // ...
 *   }
 * }
 * ```
 *
 * @param keyOrValidator The name of the query parameter or a Validator for the entire query object.
 * @param validator Optional Validator for the specific query parameter.
 * @returns An argument descriptor for the query parameter.
 */
export const Query = createInputDescriptor("query");

/**
 * Create a descriptor that sets the args field on a controller, feature, or method.
 * Works with both class-level decorators (Controller/Feature) and method decorators (Get/Post/etc.).
 *
 * @example Usage
 *
 * ```ts
 * // As a class-level args on a controller or feature
 * 〇Controller(Args(Param("id", IdValidator), Query("search")))
 * class UsersController {}
 *
 * // As a method-level args
 * class UsersController {
 *   〇Get(Args(Param("id", IdValidator)))
 *   getUser(id: string) {}
 * }
 * ```
 *
 * @param args One or more argument descriptors created with Param, Query, Body, Header, or Cookie.
 * @returns A descriptor function that assigns the args.
 */
export function Args(...args: ArgumentDescriptor[]): DescriptorFn {
  return (d: Partial<{ args: ArgumentDescriptor[] }>) => {
    d.args = args;
    return d;
  };
}

/**
 * Create a descriptor that sets the route field on a controller, feature, or method.
 * Works with both class-level decorators (Controller/Feature) and method decorators (Get/Post/etc.).
 *
 * @example Usage
 *
 * ```ts
 * // As a class-level route on a controller or feature
 * 〇Controller(Route("users"))
 * class UsersController {}
 *
 * // As a method-level route
 * class UsersController {
 *   〇Get(Route(":id"))
 *   getUser() {}
 * }
 * ```
 *
 * @param route The relative route (without leading slash), e.g. "users" or ":id".
 * @returns A descriptor function that assigns the route.
 */
export function Route<D extends { route: string }>(
  route: string,
): DescriptorFn {
  return (d: Partial<D>) => {
    d.route = route;
    return d;
  };
}

/**
 * Add one or more middlewares to a controller, feature, or method.
 * Middlewares can be classes or tokens that resolve to middleware handlers in your runtime.
 *
 * @example Usage
 *
 * ```ts
 * // Apply middlewares to a controller
 * 〇Controller(Route("users"), Middlewares(AuthMiddleware, RateLimitToken))
 * class UsersController {}
 *
 * // Apply middlewares to a specific endpoint
 * class UsersController {
 *   〇Get("profile", Middlewares(AuthMiddleware))
 *   me() {}
 * }
 * ```
 *
 * @param middlewares One or more middleware identifiers (classes or tokens).
 * @returns A descriptor function that appends middlewares.
 */
export function Middlewares<D extends { middlewares: Target[] }>(
  ...middlewares: (Ctr | Token)[]
): DescriptorFn {
  return (d: Partial<D>) => {
    // todo validate middlewares
    if (d.middlewares) {
      d.middlewares.push(...middlewares as Target[]);
    } else {
      d.middlewares = [...middlewares] as Target[];
    }
    return d;
  };
}

/**
 * Add one or more guards to a controller, feature, or method.
 * Guards are similar to middlewares but are typically used for authorization checks.
 *
 * @example
 *
 * ```ts
 * // Apply guards to a controller
 * 〇Controller(Route("admin"), Guards(AdminGuard))
 * class AdminController {}
 *
 * // Apply guards to a specific endpoint
 * class UsersController {
 *  〇Get("settings", Guards(AuthGuard, SettingsGuard))
 *  settings() {}
 *  }
 * ```
 *
 * @param guards One or more guard identifiers (classes or tokens).
 * @returns A descriptor function that appends guards.
 */
export function Guards<D extends { middlewares: Target[] }>(
  ...guards: (Ctr | Token)[]
): DescriptorFn {
  return (d: Partial<D>) => {
    // todo validate guards
    if (d.middlewares) {
      d.middlewares.push(...guards as Target[]);
    } else {
      d.middlewares = [...guards] as Target[];
    }
    return d;
  };
}

/**
 * Register controller classes under a feature.
 * Useful with the Feature decorator to declare which controllers belong to the feature.
 *
 * @example Usage
 *
 * ```ts
 * 〇Feature(
 *   Route("api"),
 *   Controllers(UsersController, AdminController),
 * )
 * class ApiFeature {}
 * ```
 *
 * @param controllers One or more controller classes.
 * @returns A descriptor function that appends controllers.
 */
export function Controllers<D extends FeatureMeta>(
  ...controllers: Ctr[]
): DescriptorFn {
  return (d: Partial<D>) => {
    if (d.controllers) {
      d.controllers.push(...controllers);
    } else {
      d.controllers = [...controllers];
    }
    return d;
  };
}

/**
 * Register sub-feature classes under a feature.
 * Use to build nested feature trees with their own routes and middlewares.

 * @example
 *
 * ```ts
 * 〇Feature(
 *   Route("v1"),
 *   Features(AuthFeature, UsersFeature),
 * )
 * class V1Feature {}
 * ```
 *
 * @param features One or more feature classes.
 * @returns A descriptor function that appends features.
 */
export function Features<D extends FeatureMeta>(
  ...features: Ctr[]
): DescriptorFn {
  return (d: Partial<D>) => {
    if (d.features) {
      d.features.push(...features);
    } else {
      d.features = [...features];
    }
    return d;
  };
}

// transformation functions

/**
 * Convert a simple function into a Guard middleware.
 * The function should return a boolean or a Promise that resolves to a boolean.
 * If it returns true, the request proceeds; if false, a "Forbidden" error is thrown.
 *
 * @param fn
 * @return MiddlewareHandler middleware function
 */
export function AsGuard(fn: (...args: unknown[]) => boolean | Promise<boolean>): Middleware {
  return async function (ctx: ChoContext<Any>, next: Next) {
    const ret = await fn(ctx, next);
    if (ret) {
      return next();
    } else {
      throw new Error("Forbidden");
    }
  };
}
