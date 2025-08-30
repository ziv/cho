import type { Ctr, Target } from "@chojs/core/di";
import { read, write } from "@chojs/core/di";

const MethodMetadata = Symbol("MethodMetadata");
const ControllerMetadata = Symbol("ControllerMetadata");
const FeatureMetadata = Symbol("Feature");

/**
 * A type representing controller metadata including route and middlewares.
 */
export type ControllerMeta = {
  route: string;
  middlewares: Target[];
};

/**
 * Set controller-level metadata on a target using a symbol-keyed property.
 * Applies defaults for missing fields (empty route string and empty middleware list).

 * @example
 *
 * ```ts
 * class UsersController {}
 * setController(UsersController, { route: "users", middlewares: [] });
 * ```
 *
 * @param target The controller class to annotate.
 * @param data Partial metadata including route and middlewares.
 * @return void
 */
export function setController(
  target: Target,
  data: Partial<ControllerMeta>,
): void {
  write(target, ControllerMetadata, {
    route: data.route ?? "",
    middlewares: data.middlewares ?? [],
  });
}

/**
 * A type representing feature metadata including route, middlewares, controllers, and sub-features.
 */
export type FeatureMeta = {
  route: string;
  middlewares: Target[];
  controllers: Ctr[];
  features: Ctr[];
};

/**
 * Set feature-level metadata on a target using a symbol-keyed property.
 * Initializes missing arrays (middlewares, controllers, features) to empty.
 *
 * @example
 *
 * ```ts
 * class ApiFeature {}
 * setFeature(ApiFeature, { route: "api", controllers: [], features: [] });
 * ```
 *
 * @param target The feature class to annotate.
 * @param data Partial metadata including route, middlewares, controllers, and features.
 */
export function setFeature(
  target: Target,
  data: Partial<FeatureMeta>,
): void {
  write(target, FeatureMetadata, {
    route: data.route ?? "",
    middlewares: data.middlewares ?? [],
    controllers: data.controllers ?? [],
    features: data.features ?? [],
  });
}

/**
 * A type representing method metadata including name, route, HTTP method, and middlewares.
 */
export type MethodMeta = {
  name: string;
  route: string;
  method: string;
  middlewares: Target[];
  // validators
  // body?: any;
  // query?: any;
};

/**
 * Set method-level metadata on a method target using a symbol-keyed property.
 * Applies defaults for missing fields (empty name/route, method defaults to "GET").

 * @example Usage
 *
 * ```ts
 * class UsersController {
 *   getUser() {}
 * }
 * setMethod(UsersController.prototype.getUser, { name: "getUser", route: ":id", method: "GET" });
 * ```
 *
 * @param target The method function (e.g. Controller.prototype.method).
 * @param data Partial metadata including name, route, method, and middlewares.
 */
export function setMethod(
  target: Target,
  data: Partial<MethodMeta>,
): void {
  write(target, MethodMetadata, {
    name: data.name ?? "",
    route: data.route ?? "",
    method: data.method ?? "GET",
    middlewares: data.middlewares ?? [],
  });
}

/**
 * Read feature metadata from a target if present.

 * @example Usage
 *
 * ```ts
 * const meta = getFeature(ApiFeature);
 * console.log(meta?.controllers?.length ?? 0);
 * ```
 *
 * @param target The feature class to read from.
 * @returns The FeatureMeta or undefined if not set.
 */
export function getFeature(target: Target): FeatureMeta | undefined {
  return read<FeatureMeta>(target, FeatureMetadata);
}

/**
 * Read controller metadata from a target if present.
 *
 * @example Usage
 *
 * ```ts
 * const meta = getController(UsersController);
 * console.log(meta?.middlewares?.length ?? 0);
 * ```
 *
 * @param target The controller class to read from.
 * @returns The ControllerMeta or undefined if not set.
 */
export function getController(
  target: Target,
): ControllerMeta | undefined {
  return read<ControllerMeta>(target, ControllerMetadata);
}

/**
 * Read method metadata from a method target if present.
 *
 * @example Usage
 *
 * ```ts
 * const meta = getMethod(UsersController.prototype.getUser);
 * console.log(meta?.method, meta?.route);
 * ```
 *
 * @param target The method function to read from (e.g. Controller.prototype.method).
 * @returns The MethodMeta or undefined if not set.
 */
export function getMethod(
  target: Target,
): MethodMeta | undefined {
  return read<MethodMeta>(target, MethodMetadata);
}

/**
 * Read all method metadata entries defined on a controller class.
 * Scans the prototype for function properties (excluding the constructor) and returns those with metadata.
 *
 * @example Usage
 *
 * ```ts
 * class UsersController {
 *   getUser() {}
 *   list() {}
 * }
 * // setMethod(...) must be used by decorators beforehand
 * const metas = getMethods(UsersController);
 * console.log(metas.map(m => `${m.method} ${m.route}`));
 * ```
 *
 * @param ctr The controller class whose methods to inspect.
 * @returns An array of MethodMeta objects for the controller's endpoints.
 */
export function getMethods(ctr: Ctr): MethodMeta[] {
  const props = Object.getOwnPropertyNames(
    ctr.prototype,
  ) as (string & keyof typeof ctr.prototype)[];

  return props
    .filter((name) => name !== "constructor")
    .filter((name) => typeof ctr.prototype[name] === "function")
    .map((name) => getMethod(ctr.prototype[name]))
    .filter(Boolean) as MethodMeta[];
}
