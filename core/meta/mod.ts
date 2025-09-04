/**
 * MetaTypes
 * =========
 * Sometimes we need to use `any` type or `Function` type in TypeScript,
 * but it's generally discouraged.
 * However, in the context of dependency injection and dynamic resolution,
 * we often need to work with generic types and dynamic values.
 * Therefore, we define these types here for convenience.
 */

/**
 * Real any type.
 * @internal
 */
// deno-lint-ignore no-explicit-any
export type Any = any;

/**
 * Real Function type.
 * @internal
 */
// deno-lint-ignore ban-types
export type Target = Function;

/**
 * Instance type for objects.
 * This is a utility type that represents an instance of a given object type.
 * @internal
 */
export type Instance<T extends object = object> = T;

/**
 * Constructor type for classes.
 */
export type Ctr<T = Any> = new (...args: Any[]) => T;

// metadata read/write utilities
// ------------------------------------

const MetaKey = Symbol("meta");
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
 * Add properties to the metadata object of a target.
 * Merges with existing metadata object if present.
 *
 * @param target
 * @param obj
 */
export function addToMetadataObject(
    target: Target,
    obj: Record<string, unknown>,
) {
    const existing = readMetadataObject<Record<string, unknown>>(target) ?? {};
    writeMetadataObject(target, { ...existing, ...obj });
}
