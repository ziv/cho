import type {Ctr, DescriptorFn, Target, Token} from "@chojs/core/di";
import {FeatureMeta} from "./meta.ts";

/**
 * Create a descriptor that sets the route field on a controller, feature, or method.
 * Works with both class-level decorators (Controller/Feature) and method decorators (Get/Post/etc.).
 * @param route The relative route (without leading slash), e.g. "users" or ":id".
 * @returns A descriptor function that assigns the route.
 * @example
 * // As a class-level route on a controller or feature
 * @Controller(Route("users"))
 * class UsersController {}
 *
 * // As a method-level route
 * class UsersController {
 *   @Get(Route(":id"))
 *   getUser() {}
 * }
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
 * @param middlewares One or more middleware identifiers (classes or tokens).
 * @returns A descriptor function that appends middlewares.
 * @example
 * // Apply middlewares to a controller
 * @Controller(Route("users"), Middlewares(AuthMiddleware, RateLimitToken))
 * class UsersController {}
 *
 * // Apply middlewares to a specific endpoint
 * class UsersController {
 *   @Get("profile", Middlewares(AuthMiddleware))
 *   me() {}
 * }
 */
export function Middlewares<D extends { middlewares: Target[] }>(
  ...middlewares: (Ctr | Token)[]
): DescriptorFn {
  return (d: Partial<D>) => {
    if (d.middlewares) {
      d.middlewares.push(...middlewares as Target[]);
    } else {
      d.middlewares = [...middlewares] as Target[];
    }
    return d;
  };
}

/**
 * Register controller classes under a feature.
 * Useful with the Feature decorator to declare which controllers belong to the feature.
 * @param controllers One or more controller classes.
 * @returns A descriptor function that appends controllers.
 * @example
 * @Feature(
 *   Route("api"),
 *   Controllers(UsersController, AdminController),
 * )
 * class ApiFeature {}
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
 * @param features One or more feature classes.
 * @returns A descriptor function that appends features.
 * @example
 * @Feature(
 *   Route("v1"),
 *   Features(AuthFeature, UsersFeature),
 * )
 * class V1Feature {}
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
