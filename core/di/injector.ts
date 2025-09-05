import type { Any, Ctr } from "../meta/mod.ts";
import type {
  InjectableDescriptor,
  ModuleDescriptor,
  Provider,
  Resolver,
  Token,
} from "./types.ts";
import { debuglog } from "../utils/debuglog.ts";
import { read, readMetadataObject, write } from "../meta/mod.ts";

const log = debuglog("di:injector");

const InjectorMetadata = Symbol("ModuleInjector");

const tokenName = (token: Token) =>
  (typeof token === "function" && token.name) ? token.name : String(token);

export type SearchResultProvider = {
  type: "provider";
  value: Provider;
};

export type SearchResultResolved = {
  type: "resolved";
  value: Any;
};

export type SearchResultNotFound = {
  type: "not-found";
  value: null;
};

export type SearchResultCircular = {
  type: "circular-dependency-detected";
  value: Injector[];
};

export type SearchResult =
  | SearchResultProvider
  | SearchResultResolved
  | SearchResultNotFound
  | SearchResultCircular;

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
        [] as Token[];
      const args: unknown[] = await Promise.all(
        deps.map((d: Token) => r.resolve(d)),
      );
      return Reflect.construct(ctr, args);
    },
  };
}

/**
 * Dependency Injector
 * This class is responsible for resolving dependencies and managing the lifecycle of instances.
 * It implements the Resolver interface and provides methods to resolve tokens, create instances,
 * and manage providers.
 */
export class Injector implements Resolver {
  readonly name: string;
  readonly providers: Provider[] = [];
  readonly imports: Ctr[] = [];
  readonly cache: Map<Token, Any> = new Map<Token, Any>();

  /**
   * Create an injector for a given module class.
   * This method initializes the injector, registers the module itself as a provider,
   * and resolves the module to ensure all its dependencies are instantiated.
   *
   * @param ctr
   * @returns Promise of the created Injector instance
   */
  static async create(ctr: Ctr): Promise<Injector> {
    log(`creating ${ctr.name} injector`);
    const injector = new Injector(ctr);
    // add self to providers
    await injector.register(ctr).resolve(ctr);
    return injector;
  }

  static read(ctr: Ctr): Injector | undefined {
    return read<Injector>(ctr, InjectorMetadata);
  }

  constructor(
    readonly ctr: Ctr,
  ) {
    const inj = read(ctr, InjectorMetadata);
    if (inj) {
      throw new Error(`Injector already set for this module`);
    }
    const meta = readMetadataObject<ModuleDescriptor>(ctr);
    if (!meta) {
      throw new Error(`${ctr.name} is not a module`);
    }

    for (const p of meta.providers ?? []) {
      this.register(p);
    }

    for (const im of meta.imports ?? []) {
      this.registerImport(im);
    }

    this.name = `${ctr.name}Injector`;
    log(`${this.name} created`);

    // set the injector instance on the module constructor
    write(ctr, InjectorMetadata, this);
  }

  /**
   * Register a provider or a class constructor as a provider.
   *
   * @param provider
   */
  register(provider: Provider | Ctr): Injector {
    // last wins strategy (don't check for duplicates)
    if (typeof provider !== "function") {
      this.providers.push(provider);
      return this;
    }
    // create provider from class constructor
    this.providers.push(provide(provider));
    return this;
  }

  /**
   * Register an imported module.
   *
   * @param ctr
   */
  registerImport(ctr: Ctr) {
    if (typeof ctr !== "function") {
      throw new Error(
        `${this.name}: Cannot register import. Not a class.`,
      );
    }
    if (!readMetadataObject(ctr)) {
      throw new Error(
        `${this.name}: Cannot register ${ctr.name} as import. Did you forget to add @Module()?`,
      );
    }
    if (!this.imports.includes(ctr)) {
      this.imports.push(ctr);
    }
  }

  /**
   * Resolve a token to its corresponding instance.
   * @param token
   * @returns Promise of the resolved instance
   */
  async resolve<T>(token: Token): Promise<T> {
    const { type, value } = await this.search(token);
    if (type === "resolved") {
      return Promise.resolve(value as T);
    }

    if (type === "provider") {
      const instance = await value.factory(this);
      this.cache.set(token, instance);
      return instance as T;
    }

    // todo missing tests
    if (type === "circular-dependency-detected") {
      const path = value.map((i) => i.name).join(" → ");
      throw new Error(
        `${this.name}: Circular dependency detected while resolving ${
          tokenName(token)
        }: ${path} → ${tokenName(token)}`,
      );
    }

    throw new Error(`${this.name}: ${tokenName(token)} not found`);
  }

  /**
   * Search for a provider by its token in the current module and its imports.
   * If not found locally, it will recursively search in imported modules.
   *
   * @param token
   * @param ref
   * @returns SearchResult indicating whether the token was resolved, found as a provider, or not found.
   */
  async search(token: Token, ref: Injector[] = []): Promise<SearchResult> {
    if (ref.includes(this)) {
      return {
        type: "circular-dependency-detected",
        value: ref,
      } as SearchResultCircular;
    }

    if (this.cache.has(token)) {
      return {
        type: "resolved",
        value: this.cache.get(token),
      } as SearchResultResolved;
    }

    const provider = this.providers.find((p) => p.provide === token);

    if (provider) {
      return {
        type: "provider",
        value: provider,
      };
    }

    const next = [...ref, this];
    for (const im of this.imports) {
      const injector = Injector.read(im) || await Injector.create(im);
      const res = await injector.search(token, next);
      if (res.type !== "not-found") {
        // propagate resolved, provider or circular results
        return res;
      }
    }

    return {
      type: "not-found",
      value: null,
    };
  }

  /**
   * Get a provider by its token.
   * @deprecated
   * @param token
   * @returns Provider or undefined if not found
   */
  // provider(token: Token): Provider | undefined {
  //     return this.desc.providers.find((p) => p.provide === token);
  // }

  /**
   * Create an instance of a class with its dependencies resolved.
   *
   * @deprecated
   * @param ctr
   * @param deps
   * @returns Promise of the created instance
   */
  // async create(ctr: Ctr, deps?: Token[]): Promise<Instance> {
  //     if (!deps) {
  //         deps = getInjectable(ctr)?.deps ?? [];
  //     }
  //     const args = await Promise.all(deps.map((d) => this.resolve(d)));
  //     return Reflect.construct(ctr, args) as Instance;
  // }
}
