import type { Any, InjectableDescriptor, MethodContext, Target } from "@chojs/core/di";
import { writeMetadataObject } from "@chojs/core/di";
import type { FeatureDescriptor } from "./types.ts";
import { writeMethod } from "./meta.ts";

export type MethodDecoratorFn = (
  route: string | DescriptorFn,
  ...fns: DescriptorFn[]
) => Any; // to avoid TS strict mode error on decorators

/**
 * Creates a method decorator for the given HTTP method.
 */
function createMethodDecorator(
  type: string,
): MethodDecoratorFn {
  /** */
  return function (route: string) {
    /**
     * context param
     * - `string` | `symbol to support TS experimental decorators (Bun, TS < 5.0, reflect-metadata, etc.)
     * - `MethodContext` to support TC39 stage 3 proposal decorators (ESM/Deno/TS)
     */
    return function (
      target: Any,
      context: MethodContext | string | symbol,
    ) {
      // method name
      const name = typeof context === "string" ? context : (context as MethodContext).name;
      writeMethod(target, { name, route, type });
    };
  };
}

/**
 * Marks a class as a web controller.
 *
 * @return {ClassDecorator}
 * @param route
 * @param desc
 */
export function Controller(route: string, desc?: InjectableDescriptor): ClassDecorator {
  return (target: Target) => {
    const data = {
      route,
      deps: desc?.deps ?? [],
    };
    writeMetadataObject(target, data);
  };
}

/**
 * Marks a class as a web feature module.
 *
 * @return {ClassDecorator}
 * @param desc
 */
export function Feature(desc: FeatureDescriptor): ClassDecorator {
  return (target: Target) => {
    const data = {
      route: desc.route ?? "",
      imports: desc.imports ?? [],
      providers: desc.providers ?? [],
      deps: desc.deps ?? [],
      controllers: desc.controllers,
    };
    writeMetadataObject(target, data);
  };
}

// HTTP Method decorators
export const Get: MethodDecoratorFn = createMethodDecorator("GET");
export const Post: MethodDecoratorFn = createMethodDecorator("POST");
export const Put: MethodDecoratorFn = createMethodDecorator("PUT");
export const Delete: MethodDecoratorFn = createMethodDecorator("DELETE");
export const Patch: MethodDecoratorFn = createMethodDecorator("PATCH");

// Other HTTP decorators
export const Sse: MethodDecoratorFn = createMethodDecorator("SSE");
export const Sseit: MethodDecoratorFn = createMethodDecorator("SSEIT");
export const Stream: MethodDecoratorFn = createMethodDecorator("STREAM");
export const WebSocket: MethodDecoratorFn = createMethodDecorator("WS");
