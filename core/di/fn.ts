/**
 * # Functional API for Dependency Injection
 */
import type {
  Ctr,
  DescriptorFn,
  Factory,
  InjectableDescriptor,
  ModuleDescriptor,
  Resolver,
  Token,
} from "./types.ts";
import { GetInjectable } from "./meta.ts";

// providing functions

/**
 * Mark an injectable as depending on other tokens.
 * This function can be used to specify dependencies that the injectable requires to function properly.
 * It can be used in the context of an injectable descriptor to define its dependencies.
 *
 * @example:
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
 */
export function DependsOn<T extends InjectableDescriptor>(
  ...tokens: Token[]
): DescriptorFn<T> {
  return (d: T) => {
    if ("dependencies" in d) {
      d.dependencies.push(...tokens);
    }
    return d;
  };
}

/**
 * Create a provider for a token.
 * This function can be used to provide a value using a factory function or a class as a dependency.
 * Should be run in creating module context only.
 *
 * @example factory function:
 * ```ts
 * @Module(
 *      provide("foo", () => "Foo Value"),
 * )
 * class MyModule {}
 * ```
 *
 * @example injectable class:
 * ```ts
 * @Module(
 *     provide(MyService),
 * )
 * class MyModule {}
 * ```
 *
 * @param token
 * @param factory
 */
export function Provide<T, D extends ModuleDescriptor>(
  token: Token,
  factory?: Factory<T>,
): DescriptorFn<D> {
  if (factory) {
    return (d: D) => {
      if ("providers" in d) {
        d.providers.push({
          provide: token,
          factory,
        });
      }

      return d;
    };
  }
  // no factory but token is a class
  // create the factory from the class constructor
  if (typeof token === "function") {
    return (d: D) => {
      if ("providers" in d) {
        d.providers.push({
          provide: token,
          factory: async (i: Resolver) => {
            const args = await Promise.all(
              GetInjectable(token)
                .dependencies
                .map((dep) => i.resolve(dep)),
            );
            return Reflect.construct(token, args);
          },
        });
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
 * @example:
 * ```ts
 * @Module(
 *      imports(ModuleA, ModuleB),
 * )
 * class MyModule {}
 * ```
 *
 * @param modules
 */
export function Imports<D extends ModuleDescriptor>(
  ...modules: Ctr[]
): DescriptorFn<D> {
  return (d: D) => {
    if ("imports" in d) {
      d.imports.push(...modules);
    }
    return d;
  };
}
