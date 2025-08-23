import type {
  Ctr,
  InjectableDescriptor,
  ModuleDescriptor,
  Target,
} from "./types.ts";
import { read, write } from "./utils.ts";
import type { Injector } from "./injector.ts";

export const InjectableMetadata = Symbol("InjectableDescriptor");
export const ModuleMetadata = Symbol("ModuleDescriptor");
export const InjectorMetadata = Symbol("ModuleInjector");

export function setInjector(target: Target, injector: Injector) {
  write(target, InjectorMetadata, injector);
}

export function setInjectable(
  target: Target,
  data: Partial<InjectableDescriptor>,
) {
  write(target, InjectableMetadata, {
    dependencies: data.dependencies ?? [],
  });
}

export function setModule(target: Target, data: Partial<ModuleDescriptor>) {
  write(target, ModuleMetadata, {
    imports: data.imports ?? [],
    providers: data.providers ?? [],
  });
}

export function getInjectable(
  target: Target,
): InjectableDescriptor | undefined {
  return read<InjectableDescriptor>(target, InjectableMetadata);
}

export function getModule(target: Target): ModuleDescriptor | undefined {
  return read<ModuleDescriptor>(target, ModuleMetadata);
}

export function getInjector(target: Target): Injector | undefined {
  return read<Injector>(target, InjectorMetadata);
}
//
// // factories
//
// /**
//  * Create a descriptor creator function that applies a series of descriptor functions
//  * to an initial value, returning the final modified value.
//  *
//  * @returns A function that takes a variable number of descriptor functions and applies them to the initial value.
//  */
// export function createDescriptorCreator<T>() {
//   return (...fns: DescriptorFn<T>[]): Partial<T> => {
//     let value = {};
//     for (const fn of fns) {
//       value = fn(value);
//     }
//     return value;
//   };
// }
//
// /**
//  * Create a function to retrieve metadata from a target object.
//  * @param key
//  */
// export function createGetMetadata<T>(key: symbol) {
//   return (target: Target): T => {
//     const ret = read(target, key);
//     if (!ret) {
//       throw new Error(`Metadata ${String(key)} not found on target.`);
//     }
//     return ret as T;
//   };
// }
//
// /**
//  * Create a function to set metadata on a target object.
//  * @param key
//  * @param keys
//  */
// export function createSetMetadata<T extends Record<string, unknown>>(
//   key: symbol,
//   keys: (keyof T)[],
// ) {
//   return (target: Target, descriptor: T) => {
//     const reduced = keys.reduce((acc, cur) => {
//       if (cur in descriptor) {
//         acc[cur as keyof typeof cur] = descriptor[cur];
//       }
//       return acc;
//     }, {} as Record<string, Any>);
//     write(target, key, reduced);
//   };
// }
//
// // metadata accessors
//
// /**
//  * Create an injectable descriptor from a list of functions.
//  * This function can be used to create an injectable descriptor by applying a series of functions
//  * that modify the injectable descriptor.
//  *
//  * @example:
//  * ```ts
//  * const myInjectable = createInjectable(
//  *      dependsOn("foo", "bar"),
//  * );
//  * ```
//  *
//  * @param fns
//  */
// export const CreateInjectable = createDescriptorCreator<InjectableDescriptor>({
//   dependencies: [] as Token[],
// });
//
// /**
//  * Create a module descriptor from a list of functions.
//  * This function can be used to create a module descriptor by applying a series of functions
//  * that modify the module descriptor.
//  *
//  * @example:
//  * ```ts
//  * const myModule = createModule(
//  *      imports(ModuleA, ModuleB),
//  *      provide("foo", () => "Foo Value"),
//  * );
//  * ```
//  *
//  * @param fns
//  */
// export const CreateModule = createDescriptorCreator<ModuleDescriptor>({
//   dependencies: [] as Token[],
//   imports: [] as Ctr[],
//   providers: [] as Provider[],
// });
//
// /**
//  * Get the injector for a class.
//  * This function retrieves the injector associated with a class.
//  * If the class does not have an injector, it throws an error.
//  */
// export const GetInjector = createGetMetadata<Injector>(InjectorMetadata);
//
// /**
//  * Get the injectable descriptor for a class.
//  * This function retrieves the injectable descriptor associated with a class.
//  * If the class does not have an injectable descriptor, it throws an error.
//  */
// export const GetInjectable = createGetMetadata<InjectableDescriptor>(
//   InjectableMetadata,
// );
//
// export const GetModule = createGetMetadata<ModuleDescriptor>(
//   ModuleMetadata,
// );
//
// /**
//  * Set an injectable descriptor on a class.
//  *
//  * @param ctr
//  * @param descriptor
//  */
// export const SetInjectable = createSetMetadata<InjectableDescriptor>(
//   InjectableMetadata,
//   [
//     "dependencies",
//   ],
// );
//
// /**
//  * Set an injector instance on a class.
//  *
//  * @param ctr
//  * @param descriptor
//  */
// export const SetModule = createSetMetadata<ModuleDescriptor>(
//   ModuleMetadata,
//   [
//     "imports",
//     "providers",
//   ],
// );
//
// /**
//  * Can be called only after SetModule called on the class.
//  * @param ctr
//  * @param descriptor
//  * @constructor
//  */
// export function SetInjector(ctr: Target, descriptor: ModuleDescriptor) {
//   write(ctr, InjectorMetadata, new Injector(ctr as Ctr, descriptor));
// }
