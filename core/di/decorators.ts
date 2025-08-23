/**
 * # Decorators for Dependency Injection
 */
import type { DescriptorFn, Target } from "./types.ts";
import {
  CreateInjectable,
  CreateModule,
  SetInjectable,
  SetInjector,
  SetModule,
} from "./meta.ts";

/**
 * Mark a class as injectable.
 *
 * This decorator allows the class to be used as a dependency in the dependency injection system.
 * It can be used to define dependencies that the class requires to function properly.
 * The dependencies can be specified using the `dependsOn` function.
 *
 * @example:
 * ```ts
 * @Injectable(dependsOn(SomeDependency))
 * class MyService {
 *   constructor(private someDependency: SomeDependency) {}
 * }
 * ```
 *
 * @param fns
 * @constructor
 */
export function Injectable(...fns: DescriptorFn[]): ClassDecorator {
  return (target: Target) => {
    SetInjectable(target, CreateInjectable(...fns));
  };
}

/**
 * Mark a class as a module.
 *
 * This decorator allows the class to be used as a module in the dependency injection system.
 * It can be used to define providers and imports that the module requires.
 * The providers can be specified using the `provide` function, and imports can be specified using
 * the `imports` function.
 *
 * @example:
 * ```ts
 * @Module(
 *  imports(SomeModule),
 *  provide(SomeService, () => new SomeService()),
 *  provide(SomeOtherService, (inj) => inj.resolve(SomeDependency)),
 * )
 * class MyModule {
 *  constructor(private someService: SomeService) {}
 * }
 * ```
 *
 * @param fns
 * @constructor
 */
export function Module(...fns: DescriptorFn[]): ClassDecorator {
  return (target: Target) => {
    SetInjectable(target, CreateInjectable(...fns));
    SetModule(target, CreateModule(...fns));
    SetInjector(target, CreateModule(...fns));
  };
}
