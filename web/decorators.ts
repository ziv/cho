import type { Any, ClassDecorator, ClassMethodDecorator, Ctr, MethodContext, Target } from "@chojs/core";
import { addToMetadataObject } from "@chojs/core/meta";
import { ControllerDescriptor, FeatureDescriptor, MethodArgType } from "./types.ts";

// use any to avoid TS strict mode error on decorators
// the JS decorators are not compatible with TS ones
export type MethodDecoratorFn = (route: string, args?: MethodArgType[]) => Any; // ClassMethodDecorator;

/**
 * Creates a method decorator for the given HTTP method.
 *
 * Why the decorator function check the context type?
 * Because there are two different decorator proposals:
 * - TC39 stage 3 proposal (ESM/Deno/TS > 5.0)
 * - TS experimental decorators (Bun, Experimental TS decorators, reflect-metadata, etc.)
 *
 * They have different context types.
 *
 * @param type HTTP method type (GET, POST, etc.)
 * @return {MethodDecoratorFn}
 */
function createMethodDecorator(type: string): MethodDecoratorFn {
  return function (route: string, args: MethodArgType[] = []): ClassMethodDecorator {
    return function (target, context) {
      const name = typeof context === "string" ? context : (context as MethodContext).name;
      addToMetadataObject(target, { name, route, type, args });
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
export function Controller(route: string, desc?: ControllerDescriptor): ClassDecorator {
  return (target: Target) => {
    const data = {
      // routed
      route: route ?? "",
      middlewares: desc?.middlewares ?? [],
      // injectable
      deps: desc?.deps ?? [],
    };
    addToMetadataObject(target, data);
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
      // routed
      route: desc.route ?? "",
      middlewares: desc.middlewares ?? [],
      // injectable
      deps: desc.deps ?? [],
      // module
      imports: desc.imports ?? [],
      providers: desc.providers ?? [],
      // feature
      features: desc.features ?? [],
      controllers: desc.controllers,
    };
    addToMetadataObject(target, data);
  };
}

// todo why not using the feature/controller directly?
export function Middlewares(...middlewares: (Ctr | Target)[]): ClassDecorator & ClassMethodDecorator {
  return (target: Target) => {
    addToMetadataObject(target, { middlewares });
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
