import { Ctr, DescriptorFn, MethodContext, Target } from "../core/di/types.ts";
import {
  CreateInjectable,
  CreateModule,
  SetInjectable,
  SetInjector,
  SetModule,
} from "../core/di/meta.ts";
import {
  CreateController,
  CreateFeature,
  CreateMethod,
  SetController,
  SetFeature,
  SetMethod,
  SetMiddleware,
} from "./meta.ts";

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
      fns.push((d) => ({ ...d, method, name: context.name }));
      if (typeof route === "function") {
        // if route is a function, add it to the front of the fns array
        fns.unshift(route);
      } else if (typeof route === "string") {
        // if route is a string, add a function to set the route
        fns.unshift((d) => ({ ...d, route }));
      } else {
        throw new Error("Route must be a string or a function");
      }
      SetMethod(target, CreateMethod(...fns));
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

export function Middlewares(...middlewares: any[]) {
  return (target: Target) => {
    SetMiddleware(target, { middlewares });
  };
}

export function Controller(...fns: DescriptorFn[]) {
  return (target: Target) => {
    SetInjectable(target, CreateInjectable(...fns));
    SetController(target, CreateController(...fns));
  };
}

export function Feature(...fns: DescriptorFn[]) {
  return (target: Target) => {
    SetInjectable(target, CreateInjectable(...fns));
    SetModule(target, CreateModule(...fns));
    SetInjector(target, CreateModule(...fns));
    SetFeature(target, CreateFeature(...fns));
  };
}

export const Get = createMethodDecorator("GET");
export const Post = createMethodDecorator("POST");
export const Put = createMethodDecorator("PUT");
export const Delete = createMethodDecorator("DELETE");
export const Patch = createMethodDecorator("PATCH");
export const Head = createMethodDecorator("HEAD");
export const Options = createMethodDecorator("OPTIONS");
