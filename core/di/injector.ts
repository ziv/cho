import type { Any, Ctr, ModuleDescriptor, Provider, Resolver, Token } from "./types.ts";
import { debuglog } from "../utils/debuglog.ts";
import { read, readMetadataObject, readProvider, write } from "./meta.ts";

const log = debuglog("di:injector");

const InjectorMetadata = Symbol("ModuleInjector");

const tokenName = (token: Token) => (typeof token === "function" && token.name) ? token.name : String(token);

type SearchResultProvider = {
  type: "provider";
  value: Provider;
};

type SearchResultResolved = {
  type: "resolved";
  value: Any;
};

type SearchResultNotFound = {
  type: "not-found";
  value: null;
};

type SearchResult =
  | SearchResultProvider
  | SearchResultResolved
  | SearchResultNotFound;

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
    injector.providers.push(readProvider(ctr) as Provider);
    await injector.resolve(ctr);
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
      throw new Error(`Injector already set for this module.`);
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
  register(provider: Provider | Ctr) {
    if (typeof provider !== "function") {
      this.providers.push(provider);
      return;
    }
    const fetched = readProvider(provider);
    if (!fetched) {
      throw new Error(
        `${this.name}: Cannot register ${provider.name} as provider. Did you forget to add @Injectable()?`,
      );
    }
    this.providers.push(fetched);
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

    throw new Error(`${this.name}: ${tokenName(token)} not found`);
  }

  /**
   * Search for a provider by its token in the current module and its imports.
   * If not found locally, it will recursively search in imported modules.
   *
   * @param token
   * @returns SearchResult indicating whether the token was resolved, found as a provider, or not found.
   */
  async search(token: Token): Promise<SearchResult> {
    log(`${this.name} search for "${tokenName(token)}"`);

    if (this.cache.has(token)) {
      log(`${this.name} found "${tokenName(token)}" cached`);
      return {
        type: "resolved",
        value: this.cache.get(token),
      };
    }

    const provider = this.providers.find((p) => p.provide === token);

    if (provider) {
      log(`${this.name} found provider for "${tokenName(token)}" locally`);
      return {
        type: "provider",
        value: provider,
      };
    }

    for (const im of this.imports) {
      let injector = read<Injector>(im, InjectorMetadata);
      if (!injector) {
        // if there is no injector, the module has not
        // been instantiated., create its injector to instantiate it.
        injector = await Injector.create(im);
      }
      const res = await injector.search(token);
      if (res.type !== "not-found") {
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
