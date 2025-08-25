import type { Ctr, Target } from "@chojs/core/di";
import { read, write } from "@chojs/core/di";

const MethodMetadata = Symbol("MethodMetadata");
const ControllerMetadata = Symbol("ControllerMetadata");
const FeatureMetadata = Symbol("Feature");

export type ControllerMeta = {
  route: string;
  middlewares: Target[];
};

/**
 * Set controller-level metadata on a target using a symbol-keyed property.
 * Applies defaults for missing fields (empty route string and empty middleware list).
 * @param target The controller class to annotate.
 * @param data Partial metadata including route and middlewares.
 * @example
 * class UsersController {}
 * setController(UsersController, { route: "users", middlewares: [] });
 * // Later
 * // const meta = getController(UsersController);
 * // console.log(meta?.route); // "users"
 */
export function setController(
  target: Target,
  data: Partial<ControllerMeta>,
) {
  write(target, ControllerMetadata, {
    route: data.route ?? "",
    middlewares: data.middlewares ?? [],
  });
}

export type FeatureMeta = {
  route: string;
  middlewares: Target[];
  controllers: Ctr[];
  features: Ctr[];
};

/**
 * Set feature-level metadata on a target using a symbol-keyed property.
 * Initializes missing arrays (middlewares, controllers, features) to empty.
 * @param target The feature class to annotate.
 * @param data Partial metadata including route, middlewares, controllers, and features.
 * @example
 * class ApiFeature {}
 * setFeature(ApiFeature, { route: "api", controllers: [], features: [] });
 * // Later
 * // const meta = getFeature(ApiFeature);
 * // console.log(meta?.route); // "api"
 */
export function setFeature(
  target: Target,
  data: Partial<FeatureMeta>,
) {
  write(target, FeatureMetadata, {
    route: data.route ?? "",
    middlewares: data.middlewares ?? [],
    controllers: data.controllers ?? [],
    features: data.features ?? [],
  });
}

export type MethodMeta = {
  name: string;
  route: string;
  method: string;
  middlewares: Target[];
};

/**
 * Set method-level metadata on a method target using a symbol-keyed property.
 * Applies defaults for missing fields (empty name/route, method defaults to "GET").
 * @param target The method function (e.g. Controller.prototype.method).
 * @param data Partial metadata including name, route, method, and middlewares.
 * @example
 * class UsersController {
 *   getUser() {}
 * }
 * setMethod(UsersController.prototype.getUser, { name: "getUser", route: ":id", method: "GET" });
 */
export function setMethod(
  target: Target,
  data: Partial<MethodMeta>,
) {
  write(target, MethodMetadata, {
    name: data.name ?? "",
    route: data.route ?? "",
    method: data.method ?? "GET",
    middlewares: data.middlewares ?? [],
  });
}

/**
 * Read feature metadata from a target if present.
 * @param target The feature class to read from.
 * @returns The FeatureMeta or undefined if not set.
 * @example
 * const meta = getFeature(ApiFeature);
 * console.log(meta?.controllers?.length ?? 0);
 */
export function getFeature(target: Target): FeatureMeta | undefined {
  return read<FeatureMeta>(target, FeatureMetadata);
}

/**
 * Read controller metadata from a target if present.
 * @param target The controller class to read from.
 * @returns The ControllerMeta or undefined if not set.
 * @example
 * const meta = getController(UsersController);
 * console.log(meta?.middlewares?.length ?? 0);
 */
export function getController(
  target: Target,
): ControllerMeta | undefined {
  return read<ControllerMeta>(target, ControllerMetadata);
}

/**
 * Read method metadata from a method target if present.
 * @param target The method function to read from (e.g. Controller.prototype.method).
 * @returns The MethodMeta or undefined if not set.
 * @example
 * const meta = getMethod(UsersController.prototype.getUser);
 * console.log(meta?.method, meta?.route);
 */
export function getMethod(
  target: Target,
): MethodMeta | undefined {
  return read<MethodMeta>(target, MethodMetadata);
}

/**
 * Read all method metadata entries defined on a controller class.
 * Scans the prototype for function properties (excluding the constructor) and returns those with metadata.
 * @param ctr The controller class whose methods to inspect.
 * @returns An array of MethodMeta objects for the controller's endpoints.
 * @example
 * class UsersController {
 *   getUser() {}
 *   list() {}
 * }
 * // setMethod(...) must be used by decorators beforehand
 * const metas = getMethods(UsersController);
 * console.log(metas.map(m => `${m.method} ${m.route}`));
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
