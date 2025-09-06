import type { ArgType, MethodArgType, Validator } from "./types.ts";

/**
 * Function overloads for creating method argument type objects.
 * Supports multiple signatures for different combinations of key and validator parameters.
 */
export type ArgTypeFunction = {
  (key?: string): MethodArgType;
  (validator: Validator): MethodArgType;
  (key: string, validator: Validator): MethodArgType;
};

/**
 * Creates a function to generate argument type objects for method parameters.
 *
 * The returned function can be called in multiple ways:
 * 1. Without arguments: returns an object with only the type.
 * 2. With a single string argument: returns an object with the type and key.
 * 3. With a single validator argument: returns an object with the type and validator.
 * 4. With both a string key and a validator: returns an object with the type, key, and validator.
 *
 * @param type - The argument type (param, query, header, body, cookie)
 * @return {ArgTypeFunction} - A function that creates MethodArgType objects
 * @internal
 */
function createTypeFunction(type: ArgType): ArgTypeFunction {
  return function (keyOrValidator?: string | Validator, validatorIfKey?: Validator) {
    if (!validatorIfKey) {
      if (!keyOrValidator) {
        return {
          type,
        } as MethodArgType;
      }
      if (typeof keyOrValidator !== "string") {
        return {
          type,
          validator: keyOrValidator as Validator,
        } as MethodArgType;
      }
      return {
        type,
        key: keyOrValidator,
      } as MethodArgType;
    }
    return {
      type,
      key: keyOrValidator,
      validator: validatorIfKey as Validator,
    } as MethodArgType;
  };
}

/**
 * Create URL path parameter argument input.
 *
 * If no key is provided, the entire params object will be passed.
 * If key is provided, the value will be extracted from the params object using the key.
 * If validator is provided, the value will be validated using the validator.
 *
 * @see https://ziv.github.io/cho/guide/controllers.html
 *
 * @example Basic usage
 * ```ts
 * class UserController {
 *   @Get("/users/:id", [Params("id")])
 *   getUser(id: string) {
 *     // id is extracted from URL path
 *   }
 * }
 * ```
 *
 * @example With validator
 * ```ts
 * class UserController {
 *   @Get("/users/:id", [Params("id", z.string().uuid())])
 *   getUser(id: string) {
 *     // id is guaranteed to be a valid UUID string
 *   }
 * }
 * ```
 *
 * @example All params
 * ```ts
 * class UserController {
 *   @Get("/users/:id/posts/:postId", [Params()])
 *   getUserPost(params: { id: string, postId: string }) {
 *     // receives all path parameters as an object
 *   }
 * }
 * ```
 */
export const Params: ArgTypeFunction = createTypeFunction("param");
/**
 * Create request body argument input.
 *
 * If no key is provided, the entire request body will be passed.
 * If key is provided, the value will be extracted from the body object using the key.
 * If validator is provided, the body will be validated using the validator.
 *
 * @example Basic usage
 * ```ts
 * class UserController {
 *   @Post("/users", [Body()])
 *   createUser(userData: CreateUserDto) {
 *     // userData is the parsed JSON body
 *   }
 * }
 * ```
 *
 * @example With validator
 * ```ts
 * class UserController {
 *   @Post("/users", [Body(userSchema)])
 *   createUser(userData: User) {
 *     // userData is validated against userSchema
 *   }
 * }
 * ```
 *
 * @example Extract specific field
 * ```ts
 * class UserController {
 *   @Post("/users", [Body("email")])
 *   createUser(email: string) {
 *     // only the email field from the body
 *   }
 * }
 * ```
 */
export const Body: ArgTypeFunction = createTypeFunction("body");
/**
 * Create query parameter argument input.
 *
 * If no key is provided, the entire query object will be passed.
 * If key is provided, the value will be extracted from the query object using the key.
 * If validator is provided, the query parameter will be validated using the validator.
 *
 * @example Basic usage
 * ```ts
 * class UserController {
 *   @Get("/users", [Query("page")])
 *   getUsers(page: string) {
 *     // page is extracted from ?page=1
 *   }
 * }
 * ```
 *
 * @example With validator
 * ```ts
 * class UserController {
 *   @Get("/users", [Query("page", z.string().transform(Number))])
 *   getUsers(page: number) {
 *     // page is validated and converted to number
 *   }
 * }
 * ```
 *
 * @example All query params
 * ```ts
 * class UserController {
 *   @Get("/users", [Query()])
 *   getUsers(query: Record<string, string | string[]>) {
 *     // receives all query parameters as an object
 *   }
 * }
 * ```
 */
export const Query: ArgTypeFunction = createTypeFunction("query");
/**
 * Create request header argument input.
 *
 * If no key is provided, the entire headers object will be passed.
 * If key is provided, the value will be extracted from the headers object using the key.
 * If validator is provided, the header will be validated using the validator.
 *
 * @example Basic usage
 * ```ts
 * class UserController {
 *   @Get("/profile", [Header("authorization")])
 *   getProfile(authHeader: string) {
 *     // authHeader is extracted from Authorization header
 *   }
 * }
 * ```
 *
 * @example With validator
 * ```ts
 * class UserController {
 *   @Get("/profile", [Header("content-type", z.literal("application/json"))])
 *   getProfile(contentType: string) {
 *     // validates content-type is exactly "application/json"
 *   }
 * }
 * ```
 *
 * @example All headers
 * ```ts
 * class UserController {
 *   @Get("/debug", [Header()])
 *   debugEndpoint(headers: Record<string, string | string[]>) {
 *     // receives all request headers as an object
 *   }
 * }
 * ```
 */
export const Header: ArgTypeFunction = createTypeFunction("header");

/**
 * Create cookie argument input.
 * 
 * If no key is provided, all cookies will be passed as an object.
 * If key is provided, the value will be extracted from the cookies using the key.
 * If validator is provided, the cookie will be validated using the validator.
 *
 * @example Basic usage
 * ```ts
 * class UserController {
 *   @Get("/profile", [Cookie("session")])
 *   getProfile(sessionId: string) {
 *     // sessionId is extracted from session cookie
 *   }
 * }
 * ```
 * 
 * @example With validator
 * ```ts
 * class UserController {
 *   @Get("/profile", [Cookie("userId", z.string().uuid())])
 *   getProfile(userId: string) {
 *     // validates userId cookie is a valid UUID
 *   }
 * }
 * ```
 * 
 * @example All cookies
 * ```ts
 * class UserController {
 *   @Get("/debug", [Cookie()])
 *   debugEndpoint(cookies: Record<string, string>) {
 *     // receives all cookies as an object
 *   }
 * }
 * ```
 */
export const Cookie: ArgTypeFunction = createTypeFunction("cookie");
