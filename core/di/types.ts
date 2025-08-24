/**
 * MetaTypes
 * =========
 * Sometimes we need to use `any` type or `Function` type in TypeScript,
 * but it's generally discouraged.
 * However, in the context of dependency injection and dynamic resolution,
 * we often need to work with generic types and dynamic values.
 * Therefore, we define these types here for convenience.
 */
// deno-lint-ignore no-explicit-any
export type Any = any;
// deno-lint-ignore ban-types
export type Target = Function;
export type Instance<T extends object = object> = T;

/**
 * Constructor type for classes.
 */
export type Ctr<T = Any> = new (...args: Any[]) => T;

/**
 * Token type for dependency injection.
 * It can be a string, symbol, or a class constructor.
 */
export type Token = string | symbol | Ctr;

/**
 * Resolver interface for resolving dependencies.
 * It defines a method to resolve a token to its value.
 * Implemented by the Injector class.
 */
export type Resolver = { resolve: (token: Token) => Promise<Any | undefined> };

/**
 * Factory type for creating instances of a dependency from a token.
 */
export type Factory<T = Any> = (injector: Resolver) => T;

/**
 * Provider type for defining how to provide a dependency.
 * It includes a token to identify the dependency and a factory function to create the instance.
 * The factory function receives a Resolver to resolve any dependencies needed to create the instance.
 */
export type Provider<T = Any> = {
  provide: Token;
  factory: Factory<T>;
};

export type Resolved<T = Any> = {
  value: T;
  refCount: number;
};

export type InjectableDescriptor = {
  dependencies: Token[];
};

export type ModuleDescriptor = InjectableDescriptor & {
  imports: Ctr[];
  providers: Provider[];
};

export type DescriptorFn<T = Any> = (d: Partial<T>) => Partial<T>;

/** @see decorators stage 3, TC39 */
export type MethodContext = {
  kind: string;
  name: string;
  static: boolean;
  private: boolean;
  metadata: object;
  addInitializer: (fn: () => void) => void;
  access: { get: () => unknown };
};
