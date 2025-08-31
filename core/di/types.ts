/**
 * @category @chojs/core/di
 */

/**
 * MetaTypes
 * =========
 * Sometimes we need to use `any` type or `Function` type in TypeScript,
 * but it's generally discouraged.
 * However, in the context of dependency injection and dynamic resolution,
 * we often need to work with generic types and dynamic values.
 * Therefore, we define these types here for convenience.
 */

/**
 * Real any type.
 * @internal
 */
// deno-lint-ignore no-explicit-any
export type Any = any;

/**
 * Real Function type.
 * @internal
 */
// deno-lint-ignore ban-types
export type Target = Function;

/**
 * Instance type for objects.
 * This is a utility type that represents an instance of a given object type.
 * @internal
 */
export type Instance<T extends object = object> = T;

/**
 * Constructor type for classes.
 */
export type Ctr<T = Any> = new (...args: Any[]) => T;

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
export type Resolver = { resolve: (token: Token) => Promise<Any | undefined> };

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
 * Cached resolved value with reference count.
 * This is used internally by the Injector to manage instances and their lifetimes.
 * @internal
 */
export type Resolved<T = Any> = {
    value: T;
    refCount: number;
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
    providers: Provider[];
};

/**
 * Descriptor function type for modifying descriptors.
 * It takes a partial descriptor and returns a modified partial descriptor.
 * This is used in decorators to build up metadata for injectables and modules.
 * @internal
 */
export type DescriptorFn<T = Any> = (d: Partial<T>) => Partial<T>;

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
