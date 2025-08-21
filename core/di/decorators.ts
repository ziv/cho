import {Ctr} from "./types.ts";
import {
    createInjectable,
    createModule,
    InjectableDescriptorFn,
    ModuleDescriptorFn,
    setInjectable,
    setModule
} from "./fn.ts";

export function Injectable(...fns: InjectableDescriptorFn[]): ClassDecorator {
    return (target: Ctr) => {
        setInjectable(target, createInjectable(...fns));
    };
}

export function Module(...fns: ModuleDescriptorFn[]): ClassDecorator {
    return (target: Ctr) => {
        setModule(target, createModule(...fns));
    };
}