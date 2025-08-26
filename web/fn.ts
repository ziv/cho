import type { Ctr, DescriptorFn, Target, Token } from "@chojs/core/di";
import { FeatureMeta } from "./meta.ts";
import { Guard } from "./types.ts";

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
  ...guards: (Ctr | Token | Guard)[]
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
