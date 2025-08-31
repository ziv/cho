import type {
    Ctr,
    InjectableDescriptor,
    ModuleDescriptor,
    Resolver,
    Target,
    Token,
} from "./types.ts";
import { writeMetadataObject, writeProvider } from "./meta.ts";

type Metadata = Record<string, unknown>;

/**
 * class decorator factory that writes metadata to the target
 */
function createMetaDecorator<T extends Metadata>(): (
    desc: Partial<T>,
) => ClassDecorator {
    return (desc: Partial<T>) => (target: Target) => {
        writeMetadataObject(target, desc);
        // any metadata required object is also an injectable
        // so this is a great place to auto-create its provider
        writeProvider(target, {
            provide: target as Ctr,
            factory: async (injector: Resolver) => {
                const deps = (desc.deps ?? []) as Token[];

                const args: unknown[] = await Promise.all(
                    deps.map((d) => injector.resolve(d)),
                );
                return Reflect.construct(target, args);
            },
        });
    };
}

/**
 * Mark a class as injectable and create its provider.
 */
export const Injectable = createMetaDecorator<InjectableDescriptor>();

/**
 * Mark a class as a module and create its provider.
 */
export const Module = createMetaDecorator<ModuleDescriptor>();
