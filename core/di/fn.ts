/**
 * @package @chojs/core/di
 * @module @chojs/core/di
 */
import type {
  Ctr,
  DescriptorFn,
  Factory,
  InjectableDescriptor,
  ModuleDescriptor,
  Provider,
  Resolver,
  Token,
} from "./types.ts";
import { getInjectable } from "./meta.ts";

/**
 * Mark an injectable as depending on other tokens.
 * This function can be used to specify dependencies that the injectable requires to function properly.
 * It can be used in the context of an injectable descriptor to define its dependencies.
 *
 * @example Usage:
 *
 * ```ts
 * @Injectable(
 *      dependsOn("foo", "bar"),
 * )
 * class MyService {
 *      constructor(private foo: string, private bar: string) {}
 *  }
 *  ```
 *
 * @param tokens
 * @public
 */
export function DependsOn<T extends InjectableDescriptor>(
  ...tokens: Token[]
): DescriptorFn<T> {
  return (d: Partial<T>) => {
    if (d.dependencies) {
      d.dependencies.push(...tokens);
    } else {
      d.dependencies = [...tokens];
    }
    return d as T;
  };
}

/**
 * Create a provider for a token.
 * This function can be used to provide a value using a factory function or a class as a dependency.
 * Should be run in creating module context only ([Module Decorator](./decorators.ts)).
 *
 * @example factory function:
 *
 * ```ts
 * @Module(
 *      provide("foo", () => "Foo Value"),
 * )
 * class MyModule {}
 * ```
 *
 * @example injectable class:
 *
 * ```ts
 * @Module(
 *     provide(MyService),
 * )
 * class MyModule {}
 * ```
 *
 * @param token
 * @param factory
 * @public
 */
export function Provide<T, D extends ModuleDescriptor>(
  token: Token,
  factory?: Factory<T>,
): DescriptorFn<D> {
  // factory is provided
  if (factory) {
    return (d: Partial<D>) => {
      if (d.providers) {
        d.providers.push({ provide: token, factory });
      } else {
        d.providers = [{ provide: token, factory }];
      }
      return d;
    };
  }
  // no factory but token is a class
  // create the factory from the class constructor
  if (typeof token === "function") {
    return (d: Partial<D>) => {
      const provider: Provider = {
        provide: token,
        factory: async (i: Resolver) => {
          const deps = getInjectable(token)?.dependencies ?? [];
          const args = await Promise.all(deps.map((d) => i.resolve(d)));
          return Reflect.construct(token, args);
        },
      };
      if (d.providers) {
        d.providers.push(provider);
      } else {
        d.providers = [provider];
      }
      return d;
    };
  }
  throw new Error(
    `Provider token error: ${
      String(token)
    }. It must be a function or a factory.`,
  );
}

/**
 * Mark a module as importing other modules.
 * This function can be used to specify other modules that the current module depends on.
 * It can be used in the context of a module descriptor to define its imports.
 *
 * @example Usage:
 *
 * ```ts
 * @Module(
 *      imports(ModuleA, ModuleB),
 * )
 * class MyModule {}
 * ```
 *
 * @param modules
 * @public
 */
export function Imports<D extends ModuleDescriptor>(
  ...modules: Ctr[]
): DescriptorFn<D> {
  return (d: Partial<D>) => {
    if (d.imports) {
      d.imports.push(...modules);
    } else {
      d.imports = [...modules];
    }
    return d;
  };
}
