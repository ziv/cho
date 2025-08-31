import type {
    InjectableDescriptor,
    ModuleDescriptor,
    Target,
} from "./types.ts";
import { setMetadataObject } from "./api.ts";

function createMetaDecorator<T extends Record<string, unknown>>() {
    return ((desc: T) => (target: Target) =>
        setMetadataObject(target, desc));
}

/**
 * Mark a class as injectable.
 */
export const Injectable = createMetaDecorator<InjectableDescriptor>();

/**
 * Mark a class as a module.
 */
export const Module = createMetaDecorator<ModuleDescriptor>();
