import {Provider, Target} from "@chojs/core";

// metadata read/write utilities
// ------------------------------------

const MetaKey = Symbol("meta");
const ProviderKey = Symbol("provider");

export function read<T = unknown>(
    target: Target,
    key: symbol,
): T | undefined {
    if (key in target) {
        return target[key as keyof typeof target] as T;
    }
    return undefined;
}

export function write(
    target: Target,
    key: symbol,
    value: unknown,
): void {
    Object.defineProperty(target, key, {
        value,
        writable: true,
        enumerable: true,
        configurable: true,
    });
}

export function readMetadataObject<T>(
    target: Target,
): T | undefined {
    return read<T>(target, MetaKey);
}

export function writeMetadataObject(
    target: Target,
    obj: Record<string, unknown>,
) {
    write(target, MetaKey, obj);
}

export function readProvider(
    target: Target,
): Provider | undefined {
    return read<Provider>(target, ProviderKey);
}

export function writeProvider(
    target: Target,
    provider: Provider,
): void {
    write(target, ProviderKey, provider);
}
