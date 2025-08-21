import Injector from "./injector.ts";
import type {Ctr, Factory, Provider, Resolver, Token} from "./types.ts";

export type InjectableDescriptor = {
    dependencies?: Token[];
};

export type ModuleDescriptor = {
    imports: Ctr[];
    providers: Provider[];
};

export type ModuleDescriptorFn = (md: ModuleDescriptor) => ModuleDescriptor;
export type InjectableDescriptorFn = (inj: InjectableDescriptor) => InjectableDescriptor;

const IDS = Symbol("InjectableDescriptor");
const MDS = Symbol("ModuleDescriptor");
const MIJ = Symbol("ModuleInjector");

export function provide<T>(
    token: Token,
    factory?: Factory<T>,
): ModuleDescriptorFn {
    if (factory) {
        return (md: ModuleDescriptor) => {
            md.providers.push({
                provide: token,
                factory,
            });
            return md;
        };
    }
    if (typeof token === "function") {
        return (md: ModuleDescriptor) => {
            md.providers.push({
                provide: token,
                factory: async (i: Resolver) => {
                    const deps = (token.prototype[IDS]?.dependencies ?? []) as Token[];
                    const args = await Promise.all(deps.map((dep) => i.resolve(dep)));
                    return Reflect.construct(token, args);
                },
            });
            return md;
        };
    }
    throw new Error(
        `Invalid provider token: ${
            String(token)
        }. It must be a function or a factory.`,
    );
}

export function dependsOn(...tokens: Token[]): InjectableDescriptorFn {
    return (inj: InjectableDescriptor) => {
        inj.dependencies.push(...tokens);
        return inj;
    };
}

export function imports(...modules: Ctr[]): ModuleDescriptorFn {
    return (md: ModuleDescriptor) => {
        md.imports.push(...modules);
        return md;
    };
}

export function createModule(...fns: ModuleDescriptorFn[]) {
    let mdl = {
        imports: [] as Ctr[],
        providers: [] as Provider[],
    };
    for (const desc of fns) {
        mdl = desc(mdl);
    }
    return mdl;
}

export function createInjectable(...fns: InjectableDescriptorFn[]): InjectableDescriptor {
    let inj = {
        dependencies: [] as Token[],
    };
    for (const desc of fns) {
        inj = desc(inj);
    }
    return inj;
}

export function setInjectable(ctr: Ctr, descriptor: InjectableDescriptor) {
    if (IDS in ctr.prototype) {
        throw new Error(
            `Injectable ${ctr.name} already has an injectable descriptor set.`,
        );
    }
    ctr.prototype[IDS] = descriptor;
}

export function setModule(ctr: Ctr, descriptor: ModuleDescriptor) {
    if (MDS in ctr.prototype) {
        throw new Error(
            `Module ${ctr.name} already has a module descriptor set.`,
        );
    }
    ctr.prototype[MDS] = descriptor;
    ctr.prototype[MIJ] = new Injector(ctr);
}

export function getModule(ctr: Ctr): ModuleDescriptor {
    if (MDS in ctr.prototype) {
        return ctr.prototype[MDS];
    }
    throw new Error(`Module descriptor not found for ${ctr.name}.`);
}

export function getInjector(ctr: Ctr): Injector {
    if (MIJ in ctr.prototype) {
        return ctr.prototype[MIJ];
    }
    throw new Error(`Injector not found for ${ctr.name}.`);
}
