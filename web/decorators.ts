import type { Any, DescriptorFn, InjectableDescriptor, MethodContext, ModuleDescriptor, Target } from "@chojs/core/di";
import { collect, setInjectable, setModule } from "@chojs/core/di";
import { type FeatureMeta, setController, setFeature, setMethod } from "./meta.ts";
import type { ControllerDescriptor, MethodDescriptor } from "./types.ts";

export type MethodDecoratorFn = (
  route: string | DescriptorFn,
  ...fns: DescriptorFn[]
) => Any; // to avoid TS strict mode error on decorators

/**
 * Creates a method decorator for the given HTTP method.
 * The function supports TC39 stage 3 proposal decorators (ESM/Deno/TS)
 * & TS experimental decorators (Bun, TS < 5.0).
 *
 * @param method
 * @return {MethodDecoratorFn}
 */
function createMethodDecorator(
  method: string,
): MethodDecoratorFn {
  /** */
  return function (
    route: string | DescriptorFn,
    ...fns: DescriptorFn[]
  ) {
    return function (
      target: Object,
      context: MethodContext | string | symbol,
    ) {
      const name = typeof context === "string" ? context : (context as MethodContext).name;

      // make sure to add the method and name to the fns array
      fns.push((d) => ({ ...d, method, name }));
      if (typeof route === "function") {
        // if route is a function, add it to the front of the fns array
        fns.unshift(route);
      } else if (typeof route === "string") {
        // if route is a string, add a function to set the route
        fns.unshift((d) => ({ ...d, route }));
      } else {
        throw new Error("Route must be a string or a function");
      }
      const data = collect<MethodDescriptor>(fns);
      setMethod(target as Target, data);
    };
  };
}

/**
 * Marks a class as a web controller.
 *
 * @param fns
 * @return {ClassDecorator}
 */
export function Controller(...fns: DescriptorFn[]): ClassDecorator {
  return (target: Target) => {
    const data = collect<InjectableDescriptor & ControllerDescriptor>(fns);
    setInjectable(target, data);
    setController(target, data);
  };
}

/**
 * Marks a class as a web feature module.
 *
 * @example Usage
 *
 * ```ts
 * 〇Feature(
 *    Route("api"),
 *    Controllers(UsersController, AdminController),
 *    Imports(SomeModule),
 *    Provide(SomeService, () => new SomeService()),
 * )
 * class ApiFeature {}
 * ```
 *
 * @param fns
 * @return {ClassDecorator}
 */
export function Feature(...fns: DescriptorFn[]): ClassDecorator {
  return (target: Target) => {
    const data = collect<
      InjectableDescriptor & ModuleDescriptor & FeatureMeta
    >(fns);
    setInjectable(target, data);
    setModule(target, data);
    setFeature(target, data);
  };
}

/**
 * HTTP GET Method decorator
 *
 * @example Usage
 *
 * ```ts
 * class MyController {
 *  〇Get("path")
 *  myMethod() {}
 * }
 * ```
 *
 * @type {MethodDecoratorFn}
 */
export const Get: MethodDecoratorFn = createMethodDecorator("GET");

/**
 * HTTP POST Method decorator
 *
 * @example Usage
 *
 * ```ts
 * class MyController {
 *  〇Post("path")
 *  myMethod() {}
 * }
 * ```
 *
 * @type {MethodDecoratorFn}
 */
export const Post: MethodDecoratorFn = createMethodDecorator("POST");

/**
 * HTTP PUT Method decorator
 *
 * @example Usage
 *
 * ```ts
 * class MyController {
 *  〇Put("path")
 *  myMethod() {}
 * }
 * ```
 *
 * @type {MethodDecoratorFn}
 */
export const Put: MethodDecoratorFn = createMethodDecorator("PUT");

/**
 * HTTP DELETE Method decorator
 *
 * @example Usage
 *
 * ```ts
 * class MyController {
 *  〇Delete("path")
 *  myMethod() {}
 * }
 * ```
 *
 * @type {MethodDecoratorFn}
 */
export const Delete: MethodDecoratorFn = createMethodDecorator("DELETE");

/**
 * HTTP PATCH Method decorator
 *
 * @example Usage
 *
 * ```ts
 * class MyController {
 *  〇Patch("path")
 *  myMethod() {}
 * }
 * ```
 *
 * @type {MethodDecoratorFn}
 */
export const Patch: MethodDecoratorFn = createMethodDecorator("PATCH");
