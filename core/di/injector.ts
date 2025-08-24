/**
 * # Dependency Injector
 */
import {
  Ctr,
  Instance,
  ModuleDescriptor,
  Provider,
  Resolved,
  Resolver,
  Token,
} from "./types.ts";
import { debuglog } from "@cho/core/utils";
import { getInjectable, getInjector, getModule, setInjector } from "./meta.ts";

export class Injector implements Resolver {
  readonly name: string;
  readonly desc: ModuleDescriptor;
  readonly log: (...args: unknown[]) => void;
  readonly cache = new Map<Token, Resolved>();

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
    this.log = debuglog(this.name);
    this.log(`created`);
    setInjector(ctr, this);
  }

  async resolve<T>(token: Token): Promise<T> {
    const tokenName = typeof token === "function" ? token.name : String(token);
    this.log(`search for "${tokenName}"`);

    // search in cache
    if (this.cache.has(token)) {
      this.log(`"${tokenName}" found in cache`);
      const resolved = this.cache.get(token) as Resolved;
      resolved.refCount++;
      return Promise.resolve(resolved.value as T);
    }

    // create self
    if (token === this.ctr) {
      const value = await this.create(token);
      this.log(`module ref created`);
      this.cache.set(token, {
        value,
        refCount: 1,
      });
      return value as T;
    }

    // search in providers
    const p = this.provider(token);
    if (p) {
      this.log(`"${tokenName}"found in local providers`);
      const value = await p.factory(this);
      this.cache.set(token, {
        value,
        refCount: 1,
      });
      return value as T;
    }

    // search in imports
    for (const im of this.desc.imports) {
      // to search imported modules,
      // we need first to make sure that
      // the modules are instantiated
      let injector = getInjector(im);
      if (!injector) {
        // if there is no injector, the
        // module has not been instantiated
        // create its injector and instantiate it
        injector = new Injector(im);
        await injector.resolve(im);
      }
      if (injector.provider(token)) {
        this.log(`"${tokenName}"found in imported ${im.name}`);
        return injector.resolve(token);
      }
    }
    throw new Error(`${String(token)} not found`);
  }

  /**
   * Get a provider by its token.
   * @param token
   */
  provider(token: Token): Provider | undefined {
    return this.desc.providers.find((p) => p.provide === token);
  }

  /**
   * Create an instance of a class with its dependencies resolved.
   * @param ctr
   * @param deps
   */
  async create(ctr: Ctr, deps?: Token[]): Instance {
    if (!deps) {
      deps = getInjectable(ctr)?.dependencies ?? [];
    }
    const args = await Promise.all(deps.map((d) => this.resolve(d)));
    return Reflect.construct(ctr, args) as Instance;
  }
}
