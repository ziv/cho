import type { ClassDecorator, ClassMethodDecorator, Ctr, Target } from "@chojs/core";
import { addToMetadataObject } from "@chojs/core";
import type { ControllerDescriptor, FeatureDescriptor, MethodArgType } from "./types.ts";
import type { MethodDecoratorFn } from "./meta.ts";
import { createMethodDecorator } from "./meta.ts";

/**
 * Marks a class as a web controller.
 *
 * @return {ClassDecorator}
 * @param route
 * @param desc
 */
export function Controller(
  route?: string | ControllerDescriptor,
  desc?: ControllerDescriptor,
): ClassDecorator {
  const r = route && typeof route === "string" ? route : "";
  const d = route && typeof route === "object" ? route : desc;
  return (target: Target) => {
    const data = {
      // routed
      route: r,
      middlewares: d?.middlewares ?? [],
      // injectable
      deps: d?.deps ?? [],
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
export function Feature(desc: Partial<FeatureDescriptor> = {}): ClassDecorator {
  return (target: Target) => {
    const data = {
      ...desc,

      // add defaults:

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
      controllers: desc.controllers ?? [],
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
export function Middlewares(
  ...middlewares: (Ctr | Target)[]
): ClassDecorator & ClassMethodDecorator {
  return (target: Target) => {
    addToMetadataObject(target, { middlewares });
  };
}

/**
 * Adds an error handler to a controller or a feature.
 * @param errorHandler
 * @constructor
 */
export function Catch(
  errorHandler: Ctr | Target,
): ClassDecorator {
  return (target: Target) => {
    addToMetadataObject(target, { errorHandler });
  };
}

// Methods args decorators

/**
 * Define a method arguments list.
 * Used instead of calling the second argument of HTTP method decorators.
 *
 * @example without Args:
 * ```ts
 * class MyController {
 *  @Get("items", [
 *   Query("page"),
 *   Query("limit"),
 *  ])
 *  getItems(page: number, limit: number) { ... }
 *  }
 * ```
 *
 * @example with Args:
 * ```ts
 * class MyController {
 * @Get("items")
 * @Args(Query("page"), Query("limit"))
 * getItems(page: number, limit: number) { ... }
 * }
 * ```
 * @param args
 * @constructor
 */
export function Args(...args: MethodArgType[]): ClassMethodDecorator {
  return (target: Target) => {
    addToMetadataObject(target, { args });
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
export const SseAsync: MethodDecoratorFn = createMethodDecorator("SSE_ASYNC");

/**
 * Method decorator for streaming endpoints.
 * This stream method take Unit8Array chunks and writes them to the response as they are produced.
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

/**
 * Method decorator for streaming endpoints.
 * This stream should return an async iterator that yields Unit8Array chunks to be written to the response.
 *
 * @example
 * ```ts
 * class DataController {
 *  @StreamAsync("data/async")
 *   async *streamAsyncData() {
 *     for (let i = 0; i < 10; i++) {
 *       yield new TextEncoder().encode(`Chunk ${i}\n`);
 *       await new Promise((res) => setTimeout(res, 1000));
 *     }
 *   }
 * }
 *       ```
 */
export const StreamAsync: MethodDecoratorFn = createMethodDecorator("STREAM_ASYNC");

/**
 * Method decorator for text streaming endpoints.
 * This stream method take string chunks and writes them to the response as they are produced.
 *
 * @example
 * ```ts
 * class DataController {
 *   @StreamText("data/logs")
 *   streamLogs(stream: WritableStream) { ... }
 * }
 * ```
 */
export const StreamText: MethodDecoratorFn = createMethodDecorator("STREAM_TEXT");

/**
 * Method decorator for text streaming endpoints.
 * This stream should return an async iterator that yields string chunks to be written to the response.
 *
 * @example
 * ```ts
 * class DataController {
 *   @StreamAsyncText("data/async-text")
 *     async *streamAsyncTextData() {
 *       for (let i = 0; i < 10; i++) {
 *         yield `Line ${i}\n`;
 *         await new Promise((res) => setTimeout(res, 1000));
 *       }
 *    }
 * }
 * ```
 */
export const StreamTextAsync: MethodDecoratorFn = createMethodDecorator("STREAM_TEXT_ASYNC");

/**
 * Method decorator for streaming endpoints that pipe from a ReadableStream.
 * This method should return a ReadableStream to be piped to the response.
 *
 * @example
 * ```ts
 * class FileController {
 *   @StreamPipe("files/download")
 *   downloadFile(): ReadableStream {
 *     const fileStream = getFileStreamSomehow();
 *     return fileStream;
 *   }
 * }
 * ```
 */
export const StreamPipe: MethodDecoratorFn = createMethodDecorator("STREAM_PIPE");
