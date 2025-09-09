import type { Any, Ctr } from "../meta/mod.ts";

/**
 * Token type for dependency injection.
 * It can be a string, symbol, or a class constructor.
 * @internal
 */
export type Token = string | symbol | Ctr;

/**
 * Resolver interface for resolving dependencies.
 * It defines a method to resolve a token to its value.
 * Implemented by the Injector class.
 * @internal
 */
export type Resolver = { resolve: <T>(token: Token) => Promise<T> };

/**
 * Factory type for creating instances of a dependency from a token.
 * @internal
 */
export type Factory<T = Any> = (injector: Resolver) => T;

/**
 * Provider type for defining how to provide a dependency.
 * It includes a token to identify the dependency and a factory function to create the instance.
 * The factory function receives a Resolver to resolve any dependencies needed to create the instance.
 * @internal
 */
export type Provider<T = Any> = {
  provide: Token;
  factory: Factory<T>;
};

/**
 * Injectable descriptor for defining dependencies of an injectable class.
 * It includes a list of tokens that the injectable depends on.
 * @internal
 */
export type InjectableDescriptor = {
  deps?: Token[];
};

/**
 * Module descriptor for defining imports and providers of a module.
 * It extends the InjectableDescriptor to include dependencies.
 * It includes a list of imported modules and a list of providers defined in the module.
 * @internal
 */
export type ModuleDescriptor = InjectableDescriptor & {
  imports: Ctr[];
  providers: (Provider | Ctr)[];
};

/**
 * Class decorator context (decorators stage 3, TC39)
 * This is used in class decorators to provide metadata and utilities.
 * @see https://github.com/tc39/proposal-decorators
 * @internal
 */
export type MethodContext = {
  kind: string;
  name: string;
  static: boolean;
  private: boolean;
  metadata: object;
  addInitializer: (fn: () => void) => void;
  access: { get: () => unknown };
};

/**
 * Class method decorators receive the method that is being decorated as the first value,
 * and can optionally return a new method to replace it. If a new method is returned,
 * it will replace the original on the prototype (or on the class itself in the case of static methods).
 * If any other type of value is returned, an error will be thrown.
 * @see https://github.com/tc39/proposal-decorators?tab=readme-ov-file#class-methods
 */
export type ClassDecorator = (value: Function, context: {
  kind: "class";
  name: string | undefined;
  addInitializer(initializer: () => void): void;
}) => Function | void | Any;

/**
 * Class decorators receive the class that is being decorated as the first parameter,
 * and may optionally return a new callable (a class, function, or Proxy) to replace it.
 * If a non-callable value is returned, then an error is thrown.
 * @see https://github.com/tc39/proposal-decorators?tab=readme-ov-file#class-methods
 */
export type ClassMethodDecorator = (value: Function, context: {
  kind: "method";
  name: string | symbol;
  access: { get(): unknown };
  static: boolean;
  private: boolean;
  addInitializer(initializer: () => void): void;
}) => Function | void;
