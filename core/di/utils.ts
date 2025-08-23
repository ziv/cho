import { Ctr, Target } from "./types.ts";

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

export function read<T>(
  target: Target | Ctr,
  key: symbol,
): T | undefined {
  if (key in target) {
    return target[key as keyof typeof target] as T;
  }
  return undefined;
}
