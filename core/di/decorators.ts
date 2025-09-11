import type { InjectableDescriptor, ModuleDescriptor } from "./types.ts";
import { createMetaDecorator, type MetaDecoratorFactory } from "../meta/mod.ts";

/**
 * Mark a class as injectable and create its provider.
 */
export const Injectable: MetaDecoratorFactory<InjectableDescriptor> = createMetaDecorator<InjectableDescriptor>();

/**
 * Mark a class as a module and create its provider.
 */
export const Module: MetaDecoratorFactory<ModuleDescriptor> = createMetaDecorator<ModuleDescriptor>();
