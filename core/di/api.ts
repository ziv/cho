import type {
    ClassDecorator,
    Ctr,
    InjectableDescriptor,
    ModuleDescriptor,
    Provider,
    Resolver,
    Target,
    Token,
} from "./types.ts";
import {
    readMetadataObject,
    writeMetadataObject,
    writeProvider,
} from "./meta.ts";

type Metadata = Record<string, unknown>;
type MetaDecoratorFactory<T extends Metadata> = (
    desc: Partial<T>,
) => ClassDecorator;

/**
 * class decorator factory that writes metadata to the target
 */
function createMetaDecorator<T extends Metadata>(): MetaDecoratorFactory<T> {
    return (desc: Partial<T>) => (target: Target) => {
        writeMetadataObject(target, desc);
    };
}

/**
 * Mark a class as injectable and create its provider.
 */
export const Injectable: MetaDecoratorFactory<InjectableDescriptor> =
    createMetaDecorator<InjectableDescriptor>();

/**
 * Mark a class as a module and create its provider.
 */
export const Module: MetaDecoratorFactory<ModuleDescriptor> =
    createMetaDecorator<ModuleDescriptor>();
