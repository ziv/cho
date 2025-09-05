import type { ArgType, MethodArgType, Validator } from "./types.ts";

export type ArgTypeFunction = {
  (key?: string): MethodArgType;
  (validator: Validator): MethodArgType;
  (key: string, validator: Validator): MethodArgType;
};

/**
 * Creates a function to generate argument type objects for method parameters.
 *
 * The returned function can be called in three ways:
 * 1. Without arguments: returns an object with only the type.
 * 2. With a single string argument: returns an object with the type and key.
 * 3. With a single validator argument: returns an object with the type and validator.
 * 4. With both a string key and a validator: returns an object with the type, key, and validator.
 *
 * @return {ArgTypeFunction}
 * @param type
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

export const Params: ArgTypeFunction = createTypeFunction("param");
export const Body: ArgTypeFunction = createTypeFunction("body");
export const Query: ArgTypeFunction = createTypeFunction("query");
export const Header: ArgTypeFunction = createTypeFunction("header");
export const Cookie: ArgTypeFunction = createTypeFunction("cookie");
