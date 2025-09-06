import { addToMetadataObject } from "@chojs/core";
import type { Any, ClassDecorator, ClassMethodDecorator, Ctr, MethodContext, Target } from "@chojs/core";
import { ControllerDescriptor, FeatureDescriptor, MethodArgType } from "./types.ts";

// use any to avoid TS strict mode error on decorators
// the JS decorators are not compatible with TS ones
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

/**
 * Adds middleware to a class or method.
 * Can be applied to controllers, features, or individual methods.
 *
 * @param middlewares - Array of middleware classes or functions
 * @example
 * ```ts
 * @Controller("/api")
 * @Middlewares(AuthMiddleware, LoggingMiddleware)
 * class ApiController {
 *   @Get("/users")
 *   @Middlewares(CacheMiddleware)
 *   getUsers() { ... }
 * }
 * ```
 */
export function Middlewares(...middlewares: (Ctr | Target)[]): ClassDecorator & ClassMethodDecorator {
  return (target: Target) => {
    addToMetadataObject(target, { middlewares });
  };
}

// HTTP Method decorators

/**
 * Method decorator for HTTP GET requests.
 *
 * @example
 * ```ts
 * class MyController {
 *   @Get("items")
 *   getItems() { ... }
 * }
 * ```
 */
export const Get: MethodDecoratorFn = createMethodDecorator("GET");
/**
 * Method decorator for HTTP POST requests.
 *
 * @example
 * ```ts
 * class UserController {
 *   @Post("users", [
 *      Body()
 *   ])
 *   createUser(userData: CreateUserDto) { ... }
 * }
 * ```
 */
export const Post: MethodDecoratorFn = createMethodDecorator("POST");

/**
 * Method decorator for HTTP PUT requests.
 *
 * @example
 * ```ts
 * class UserController {
 *   @Put("users/:id", [
 *      Params("id"),
 *      Body(),
 *   ])
 *   updateUser(id: string, userData: UpdateUserDto) { ... }
 * }
 * ```
 */
export const Put: MethodDecoratorFn = createMethodDecorator("PUT");

/**
 * Method decorator for HTTP DELETE requests.
 *
 * @example
 * ```ts
 * class UserController {
 *   @Delete("users/:id", [
 *      Params("id"),
 *   ])
 *   deleteUser(id: string) { ... }
 * }
 * ```
 */
export const Delete: MethodDecoratorFn = createMethodDecorator("DELETE");

/**
 * Method decorator for HTTP PATCH requests.
 *
 * @example
 * ```ts
 * class UserController {
 *   @Patch("users/:id", [Params("id"), Body()])
 *   patchUser(id: string, patches: Partial<User>) { ... }
 * }
 * ```
 */
export const Patch: MethodDecoratorFn = createMethodDecorator("PATCH");

// Other HTTP decorators

/**
 * Method decorator for Server-Sent Events (SSE) endpoints.
 *
 * @example
 * ```ts
 * class MyController {
 *   @Sse("events")
 *   streamEvents(stream, context) { ... }
 * }
 * ```
 */
export const Sse: MethodDecoratorFn = createMethodDecorator("SSE");

/**
 * Method decorator for WebSocket endpoints.
 *
 * @example
 * ```ts
 * class ChatController {
 *   @WebSocket("chat/:room", [Params("room")])
 *   handleChat(socket: WebSocket, roomId: string) { ... }
 * }
 * ```
 */
export const WebSocket: MethodDecoratorFn = createMethodDecorator("WS");

/**
 * Method decorator for streaming endpoints.
 *
 * @example
 * ```ts
 * class DataController {
 *   @Stream("data/export")
 *   exportData(stream: WritableStream) { ... }
 * }
 * ```
 */
export const Stream: MethodDecoratorFn = createMethodDecorator("STREAM");
