/**
 * @package @chojs/core/di
 * @module @chojs/core/di
 */
import type {
  InjectableDescriptor,
  ModuleDescriptor,
  Target,
} from "./types.ts";
import { read, write } from "./utils.ts";
import type { Injector } from "./injector.ts";

export const InjectableMetadata = Symbol("InjectableDescriptor");
export const ModuleMetadata = Symbol("ModuleDescriptor");
export const InjectorMetadata = Symbol("ModuleInjector");

/**
 * Attach an Injector instance to a target (class/function/object) using a symbol-keyed property.
 *
 * @example
 * ```ts
 * class MyModule {}
 * const injector = new Injector(MyModule);
 * setInjector(MyModule, injector);
 * ```ts
 *
 @param target The target that will hold the injector reference.
 @param injector The DI injector instance to associate with the target.
 */
export function setInjector(target: Target, injector: Injector) {
  write(target, InjectorMetadata, injector);
}

/**
 * Define injectable metadata on a target using a symbol-keyed property.
 * Defaults to an empty dependency list when not provided.
 *
 * @example
 * ```ts
 * class Service {}
 * setInjectable(Service, { dependencies: ["foo", "bar"] });
 * ```
 *
 * @param target The injectable target to annotate.
 * @param data Partial descriptor; only dependencies are relevant here.
 */
export function setInjectable(
  target: Target,
  data: Partial<InjectableDescriptor>,
) {
  write(target, InjectableMetadata, {
    dependencies: data.dependencies ?? [],
  });
}

/**
 * Define module metadata on a target using a symbol-keyed property.
 * Empty arrays are applied by default for imports and providers when omitted.
 *
 * @example
 * ```ts
 * class ModuleA {}
 * class ModuleB {}
 * setModule(ModuleA, { imports: [ModuleB], providers: ["foo", "bar"] });
 * ```
 *
 * @param target The module target to annotate.
 * @param data Partial module descriptor (imports/providers optional).
 */
export function setModule(target: Target, data: Partial<ModuleDescriptor>) {
  write(target, ModuleMetadata, {
    imports: data.imports ?? [],
    providers: data.providers ?? [],
  });
}

/**
 * Read injectable metadata from a target if present.
 *
 * @example
 * ```ts
 * const meta = getInjectable(SomeService);
 * if (meta) {
 *   console.log(meta.dependencies);
 * }
 * ```
 *
 * @param target The target to read from.
 * @returns The injectable descriptor or undefined if not defined.
 */
export function getInjectable(
  target: Target,
): InjectableDescriptor | undefined {
  return read<InjectableDescriptor>(target, InjectableMetadata);
}

/**
 * Read module metadata from a target if present.
 *
 * @example
 * ```ts
 * const modMeta = getModule(SomeModule);
 * console.log(modMeta?.providers);
 * ```
 *
 * @param target The target to read from.
 * @returns The module descriptor or undefined if not defined.
 */
export function getModule(target: Target): ModuleDescriptor | undefined {
  return read<ModuleDescriptor>(target, ModuleMetadata);
}

/**
 * Read the injector instance associated with a target if present.
 *
 * @example
 * ```ts
 * const inj = getInjector(SomeModule);
 * await inj?.resolve("foo");
 * ```
 *
 * @param target The target to read from.
 * @returns The Injector or undefined if not defined.
 */
export function getInjector(target: Target): Injector | undefined {
  return read<Injector>(target, InjectorMetadata);
}
