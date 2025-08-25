/**
 * @category @chojs/core/di
 */

import type { Ctr, DescriptorFn, Target } from "./types.ts";

/**
 * Collect and merge multiple descriptor functions into a single descriptor object.
 * Each function is applied in sequence, allowing for modular and reusable descriptor definitions.
 *
 * @param fns
 * @internal
 * @return T The merged descriptor object.
 */
export function collect<T>(fns: DescriptorFn[]): T {
  return fns.reduce(
    (acc, cur) => cur(acc),
    {} as Partial<T>,
  ) as T;
}

/**
 * Safely write a property to a target using a symbol key.
 * Throws an error if the property already exists to prevent accidental overwrites.
 *
 * @param target
 * @param key
 * @param value
 * @internal
 * @throws {Error} If the property already exists on the target.
 * @return void
 */
export function write(
  target: Target | Ctr,
  key: symbol,
  value: unknown,
): void {
  if (key in target) {
    throw new Error(`Property ${String(key)} already exists on target.`);
  }
  Object.defineProperty(target, key, {
    value,
    writable: true,
    enumerable: true,
    configurable: true,
  });
}

/**
 * Safely read a property from a target using a symbol key.
 * Returns undefined if the property does not exist.
 *
 * @param target
 * @param key
 * @internal
 * @return T | undefined The value of the property, or undefined if it does not exist.
 */
export function read<T>(
  target: Target | Ctr,
  key: symbol,
): T | undefined {
  if (key in target) {
    return target[key as keyof typeof target] as T;
  }
  return undefined;
}
