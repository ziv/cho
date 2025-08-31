import { Target } from "@chojs/core";

const meta = Symbol("meta");

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

export function readMetadataObject(
    target: Target,
): Record<string, unknown> | undefined {
    return read<Record<string, unknown>>(target, meta);
}

export function setMetadata(target: Target, key: symbol, value: unknown) {
    const data = read(target, meta) ?? {};
    (data[key as keyof typeof data] as unknown) = value;
    write(target, meta, data);
}

export function setMetadataObject(
    target: Target,
    obj: Record<string, unknown>,
) {
    write(target, meta, obj)
}
//
// export function addMetadata(target: Target, key: string, value: unknown) {
//     const data = read(target, meta) ?? {};
//     const k = key as keyof typeof data;
//     if (k in data) {
//         data[k].push(value);
//     } else {
//         data[k] = [value];
//     }
//     write(target, meta, data);
// }
