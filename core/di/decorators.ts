/**
 * # Decorators for Dependency Injection
 */
import type {
  DescriptorFn,
  InjectableDescriptor,
  ModuleDescriptor,
  Target,
} from "./types.ts";
import { setInjectable, setModule } from "./meta.ts";
import { collect } from "./utils.ts";

/**
 * Mark a class as injectable.
 *
 * This decorator allows the class to be used as a dependency in the dependency injection system.
 * It can be used to define dependencies that the class requires to function properly.
 * The dependencies can be specified using the `dependsOn` function.
 *
 * @example:
 * ```ts
 * @Injectable(DependsOn(SomeDependency))
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
    const data = collect<InjectableDescriptor>(fns);
    setInjectable(target, data);
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
 *  Imports(SomeModule),
 *  Provide(SomeService, () => new SomeService()),
 *  Provide(SomeOtherService, (inj) => inj.resolve(SomeDependency)),
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
    const data = collect<InjectableDescriptor & ModuleDescriptor>(fns);
    setInjectable(target, data);
    setModule(target, data);
  };
}
