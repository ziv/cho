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
  controllers: Ctr[]; // AKA  gateways
};
