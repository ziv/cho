import type { Ctr, Instance, ModuleDescriptor, Provider, Resolved, Resolver, Token } from "./types.ts";
import { debuglog } from "../utils/debuglog.ts";
import { getInjectable, getInjector, getModule, setInjector } from "./meta.ts";

const log = debuglog("di:injector");

const tokenName = (token: Token) => (typeof token === "function" && token.name) ? token.name : String(token);

type SearchResultProvider = {
  type: "provider";
  value: Provider;
};

type SearchResultResolved = {
  type: "resolved";
  value: Resolved;
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
  readonly desc: ModuleDescriptor;
  readonly #cache = new Map<Token, Resolved>();

  constructor(
    readonly ctr: Ctr,
  ) {
    const inj = getInjector(ctr);
    if (inj) {
      throw new Error(`Injector already set for this module.`);
    }
    const desc = getModule(ctr);
    if (!desc) {
      throw new Error(`${ctr.name} is not a module`);
    }
    this.desc = desc;
    this.name = `${ctr.name}Injector`;
    log(`${this.name} created`);
    setInjector(ctr, this);
  }

  /**
   * Resolve a token to its corresponding instance.
   * @param token
   * @returns Promise of the resolved instance
   */
  async resolve<T>(token: Token): Promise<T> {
    const { type, value } = await this.search(token);
    if (type === "resolved") {
      value.refCount++;
      return Promise.resolve(value.value as T);
    }

    if (type === "provider") {
      const instance = await value.factory(this);
      this.#cache.set(token, {
        value: instance,
        refCount: 1,
      });
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

    if (this.#cache.has(token)) {
      log(`${this.name} found "${tokenName(token)}" cached`);
      return {
        type: "resolved",
        value: this.#cache.get(token),
      };
    }
    const provider = this.desc.providers.find((p) => p.provide === token);
    if (provider) {
      log(`${this.name} found provider for "${tokenName(token)}" locally`);
      return {
        type: "provider",
        value: provider,
      };
    }
    for (const im of this.desc.imports) {
      let injector = getInjector(im);
      if (!injector) {
        // if there is no injector, the
        // module has not been instantiated
        // create its injector and instantiate it
        injector = new Injector(im);
        await injector.create(im);
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
   *
   * @deprecated
   * @param token
   * @returns Provider or undefined if not found
   */
  provider(token: Token): Provider | undefined {
    return this.desc.providers.find((p) => p.provide === token);
  }

  /**
   * Create an instance of a class with its dependencies resolved.
   *
   * @param ctr
   * @param deps
   * @returns Promise of the created instance
   */
  async create(ctr: Ctr, deps?: Token[]): Promise<Instance> {
    if (!deps) {
      deps = getInjectable(ctr)?.dependencies ?? [];
    }
    const args = await Promise.all(deps.map((d) => this.resolve(d)));
    return Reflect.construct(ctr, args) as Instance;
  }
}
