export function isClass(v: unknown) {
    if (typeof v !== 'function') {
        return false;
    }
    const descriptor = Object.getOwnPropertyDescriptor(v, 'prototype');
    return descriptor && descriptor.writable === false;
}