import {
  DescriptorFn,
  InjectableDescriptor,
  MethodContext,
  type ModuleDescriptor,
  Target,
} from "../core/di/types.ts";
import {
  CreateInjectable,
  CreateModule,
  SetInjectable,
  setInjectable,
  SetInjector,
  SetModule,
  setModule,
} from "../core/di/meta.ts";
import {
  CreateFeature,
  CreateMethod,
  setController,
  SetFeature,
  setFeature,
  SetMethod,
  setMethod,
} from "./meta.ts";
import { collect } from "../core/di/utils.ts";
import {
  ControllerDescriptor,
  FeatureDescriptor,
  MethodDescriptor,
} from "./types.ts";

/**
 * Creates a method decorator for the given HTTP method.
 * @param method
 */
function createMethodDecorator(method: string) {
  return function (
    route: string | DescriptorFn,
    ...fns: DescriptorFn[]
  ): ClassDecorator {
    return function (
      target: Target,
      context: MethodContext,
    ) {
      // make sure to add the method and name to the fns array
      fns.push((d) => ({
        ...d,
        method,
        name: context.name,
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
      /**
       * We are using TC39 stage 3 proposal decorators (ESM/Deno)
       * While TypeScript decorators are TS specific and do not
       * support the same API.
       * This type assertion is only for TypeScript to understand
       * that this is a class decorator.
       */
    } as unknown as ClassDecorator;
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

export const Get = createMethodDecorator("GET");
export const Post = createMethodDecorator("POST");
export const Put = createMethodDecorator("PUT");
export const Delete = createMethodDecorator("DELETE");
export const Patch = createMethodDecorator("PATCH");
export const Head = createMethodDecorator("HEAD");
export const Options = createMethodDecorator("OPTIONS");
