import { Provider, Target } from "@chojs/core";

// metadata read/write utilities
// ------------------------------------

const MetaKey = Symbol("meta");
const ProviderKey = Symbol("provider");

/**
 * Read a metadata value from a target.
 * Returns undefined if the key does not exist.
 *
 * @param target
 * @param key
 * @returns T | undefined
 */
export function read<T = unknown>(
  target: Target,
  key: symbol,
): T | undefined {
  if (key in target) {
    return target[key as keyof typeof target] as T;
  }
  return undefined;
}

/**
 * Write a metadata value to a target.
 *
 * @param target
 * @param key
 * @param value
 */
export function write(
  target: Target,
  key: symbol,
  value: unknown,
): void {
  Object.defineProperty(target, key, {
    value,
    writable: false,
    enumerable: false,
    configurable: false,
  });
}

/**
 * Read the metadata object from a target.
 * Returns undefined if no metadata object is found.
 *
 * @template T
 * @param target
 * @returns T | undefined
 */
export function readMetadataObject<T>(
  target: Target,
): T | undefined {
  return read<T>(target, MetaKey);
}

/**
 * Write a metadata object to a target.
 *
 * @param target
 * @param obj
 */
export function writeMetadataObject(
  target: Target,
  obj: Record<string, unknown>,
) {
  write(target, MetaKey, obj);
}

/**
 * Read the provider from a target.
 * Returns undefined if no provider is found.
 *
 * @param target
 * @returns Provider | undefined
 */
export function readProvider(
  target: Target,
): Provider | undefined {
  return read<Provider>(target, ProviderKey);
}

/**
 * Write a provider to a target.
 *
 * @param target
 * @param provider
 */
export function writeProvider(
  target: Target,
  provider: Provider,
): void {
  write(target, ProviderKey, provider);
}
