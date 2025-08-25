import type {
  DescriptorFn,
  InjectableDescriptor,
  MethodContext,
  ModuleDescriptor,
  Target,
} from "@chojs/core/di";
import { collect, setInjectable, setModule } from "@chojs/core/di";
import { setController, setFeature, setMethod } from "./meta.ts";
import type {
  ControllerDescriptor,
  FeatureDescriptor,
  MethodDescriptor,
} from "./types.ts";

/**
 * Creates a method decorator for the given HTTP method.
 * The function supports TC39 stage 3 proposal decorators (ESM/Deno/TS)
 * & TS experimental decorators (Bun, TS < 5.0).
 *
 * @param method
 */
function createMethodDecorator(method: string) {
  /** */
  return function (
    route: string | DescriptorFn,
    ...fns: DescriptorFn[]
  ) {
    return function (
      target: Target,
      context: MethodContext | string,
    ) {
      // make sure to add the method and name to the fns array
      fns.push((d) => ({
        ...d,
        method,
        name: typeof context === "string" ? context : context.name,
      }));
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
      setMethod(target, data);
    };
  };
}

export function Controller(...fns: DescriptorFn[]) {
  return (target: Target) => {
    const data = collect<InjectableDescriptor & ControllerDescriptor>(fns);
    setInjectable(target, data);
    setController(target, data);
  };
}

export function Feature(...fns: DescriptorFn[]) {
  return (target: Target) => {
    const data = collect<
      InjectableDescriptor & ModuleDescriptor & FeatureDescriptor
    >(fns);
    setInjectable(target, data);
    setModule(target, data);
    setFeature(target, data);
  };
}

/**
 * HTTP GET Method decorator
 * @example
 * ```ts
 * class MyController {
 *  @Get("path")
 *  myMethod() {}
 * }
 * ```
 */
export const Get = createMethodDecorator("GET");

export const Post = createMethodDecorator("POST");
export const Put = createMethodDecorator("PUT");
export const Delete = createMethodDecorator("DELETE");
export const Patch = createMethodDecorator("PATCH");
export const Head = createMethodDecorator("HEAD");
export const Options = createMethodDecorator("OPTIONS");
