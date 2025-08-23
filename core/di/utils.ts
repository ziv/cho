import { Ctr, type DescriptorFn, Target } from "./types.ts";

export function collect<T>(fns: DescriptorFn[]) {
  return fns.reduce(
    (acc, cur) => cur(acc),
    {} as Partial<T>,
  ) as T;
}

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

export function ensureArray(value: { [key: string]: unknown }, name: string) {
  if (!(name in value)) {
    value[name] = [];
  }
}
