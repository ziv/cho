import type {
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
 * Create a provider for the given class constructor.
 *
 * @param ctr
 * @returns Provider
 */
function provide(ctr: Ctr): Provider {
    return {
        provide: ctr,
        factory: async (r: Resolver) => {
            const deps = readMetadataObject<InjectableDescriptor>(ctr)?.deps ??
                [];
            const args: unknown[] = await Promise.all(
                deps.map((d) => r.resolve(d)),
            );
            return Reflect.construct(ctr, args);
        },
    };
}

/**
 * class decorator factory that writes metadata to the target
 */
function createMetaDecorator<T extends Metadata>(): MetaDecoratorFactory<T> {
    return (desc: Partial<T>) => (target: Target) => {
        writeMetadataObject(target, desc);
        // any metadata object is also an injectable
        // so this is a great place to auto-create its provider
        writeProvider(target, provide(target as Ctr));
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
