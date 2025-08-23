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
  return function (route: string): ClassDecorator {
    return function (
      target: Target,
      context: MethodContext,
    ) {
      SetMethod(target, {
        middlewares: [],
        route,
        method,
        name: context.name,
        context,
      });
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

export function Middlewares(...middlewares: (Target | Ctr)[]) {
  return (target: Target) => {
    SetMiddleware(target, middlewares);
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
