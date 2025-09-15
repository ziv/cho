import { ArgType, InputFactory, MethodArgType, Validator } from "./types.ts";
import { Context } from "./interfaces/mod.ts";
import { InvalidInputError } from "./errors.ts";

/**
 * Function overloads for creating method argument type objects.
 * Supports multiple signatures for different combinations of key and validator parameters.
 */
export type ArgTypeFunction = {
  (key?: string): MethodArgType;
  (validator: Validator): MethodArgType;
  (key: string, validator: Validator): MethodArgType;
};

export type InputTypeFunction = {
  (key?: string): InputFactory;
  (validator: Validator): InputFactory;
  (key: string, validator: Validator): InputFactory;
};

type ValueRetriever = (c: Context, key?: string) => unknown | Promise<unknown>;

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
  return function (
    keyOrValidator?: string | Validator,
    validatorIfKey?: Validator,
  ) {
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

function createInputFunctionFactory(name: string, retriever: ValueRetriever): InputTypeFunction {
  return function (
    keyOrValidator?: string | Validator,
    validatorIfKey?: Validator,
  ): InputFactory {
    const key = typeof keyOrValidator === "string" ? keyOrValidator : undefined;
    const validator = typeof keyOrValidator !== "string" ? keyOrValidator : validatorIfKey;

    return async function (c: Context): Promise<unknown> {
      const value = await retriever(c, key);
      if (!validator) {
        return value;
      }
      const parsed = validator.safeParse(value);
      if (!parsed.success) {
        const message = key
          ? `Input validation failed at argument ${name}("${key}")`
          : `Input validation failed at argument ${name}()`;
        throw new InvalidInputError(parsed.error, message);
      }
      return parsed.data;
    };
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
// export const Params: ArgTypeFunction = createTypeFunction("param");
export const Params: InputTypeFunction = createInputFunctionFactory(
  "Params",
  (c, key) => key ? c.req.param(key) : c.req.param(),
);

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
// export const BodyOld: ArgTypeFunction = createTypeFunction("body");
export const Body: InputTypeFunction = createInputFunctionFactory(
  "Body",
  async (c, key) => {
    // we can read the body only once, so we cache it in the context
    // for subsequent calls
    if (!c.get("--cached-body")) {
      c.set("--cached-body", await c.req.json());
    }
    const body = c.get("--cached-body") as Record<string, unknown>;
    return key ? body?.[key] : body;
  },
);

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
// export const Query: ArgTypeFunction = createTypeFunction("query");
export const Query: InputTypeFunction = createInputFunctionFactory(
  "Query",
  (c, key) => key ? c.req.query(key) : c.req.query(),
);

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
// export const Header: ArgTypeFunction = createTypeFunction("header");
export const Header: InputTypeFunction = createInputFunctionFactory(
  "Header",
  (c, key) => key ? c.req.header(key) : c.req.header(),
);
