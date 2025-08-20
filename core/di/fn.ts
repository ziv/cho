import type { Ctr, Factory, Injector, Provider, Token } from "./types.ts";

export type InjectableDescriptor = {
  dependencies?: Token[];
};

export type ModuleDescriptor = {
  imports: Ctr[];
  providers: Provider[];
};

export type ModuleDescriptorFn = (md: ModuleDescriptor) => ModuleDescriptor;

const IDS = Symbol("InjectableDescriptor");
const MDS = Symbol("ModuleDescriptor");

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
        factory: async (i: Injector) => {
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
}
