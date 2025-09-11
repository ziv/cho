import type { Any, ClassMethodDecorator, MethodContext } from "@chojs/core";
import { addToMetadataObject } from "@chojs/core";
import { MethodArgType } from "./types.ts";

/**
 * Function signature for method decorators that define HTTP endpoints.
 */
export type MethodDecoratorFn<R = string> = (route: R, args?: MethodArgType[]) => Any; // ClassMethodDecorator;

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
export function createMethodDecorator<R = string>(
  type: string,
): MethodDecoratorFn<R> {
  return function (
    route: R,
    args: MethodArgType[] = [],
  ): ClassMethodDecorator {
    return function (target, context) {
      let name: string;
      if (typeof context === "string") {
        name = context;
      } else if ("name" in context) {
        name = (context as MethodContext).name;
      } else {
        // todo should we throw an error here? there is no type safety guarantee
        // Fallback for unknown context types
        name = String(context);
      }
      addToMetadataObject(target, { name, route, type, args });
    };
  };
}
