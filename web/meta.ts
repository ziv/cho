import type { Any, ClassMethodDecorator, MethodContext } from "@chojs/core";
import { addToMetadataObject } from "@chojs/core";
import type { MethodArgType } from "./types.ts";

/**
 * Function signature for method decorators that define HTTP endpoints.
 */
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
export function createMethodDecorator(type: string): MethodDecoratorFn {
  return function (route: string, args: MethodArgType[] = []): ClassMethodDecorator {
    return function (target, context) {
      const name = typeof context === "string" ? context : (context as MethodContext).name;
      addToMetadataObject(target, { name, route, type, args });
    };
  };
}
