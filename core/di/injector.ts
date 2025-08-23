/**
 * # Dependency Injector
 */
import type {
  Ctr,
  ModuleDescriptor,
  Provider,
  Resolved,
  Resolver,
  Token,
} from "./types.ts";
import debuglog from "../utils/debuglog.ts";
import { getInjectable, getInjector, getModule, setInjector } from "./meta.ts";

const log = debuglog("Injector");

export default class Injector implements Resolver {
  readonly name: string;
  readonly desc: ModuleDescriptor;
  readonly cache = new Map<Token, Resolved>();

  constructor(
    readonly ctr: Ctr,
  ) {
    const desc = getModule(ctr);
    if (!desc) {
      throw new Error(`${ctr.name} is not a module`);
    }
    this.desc = desc;
    this.name = `${ctr.name}Injector`;
    log(`${this.name} created`);
    setInjector(ctr, this);
  }

  async resolve<T>(token: Token): Promise<T> {
    const name = this.name;
    const tokenName = typeof token === "function" ? token.name : String(token);
    log(`${name} search for "${tokenName}"`);

    // search in cache
    if (this.cache.has(token)) {
      log(`${name} found "${tokenName}" in cache`);
      const resolved = this.cache.get(token) as Resolved;
      resolved.refCount++;
      return resolved.value as T;
    }

    // create self
    if (token === this.ctr) {
      log(`${name} resolving module ref`);
      const args = await Promise.all(
        (getInjectable(token)?.dependencies ?? []).map((d) => this.resolve(d)),
      );
      const value = Reflect.construct(token, args);
      log(`${name} created module ref`);
      this.cache.set(token, {
        value,
        refCount: 1,
        provide: token,
        factory: () => Promise.resolve(),
      });
      return value as T;
    }

    // search in providers
    const p = this.provider(token);
    if (p) {
      log(`${name} found "${tokenName}" in local providers`);
      const value = await p.factory(this);
      log(`${name} created "${tokenName}"`);
      this.cache.set(token, { ...p, value, refCount: 1 });
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
        return injector.resolve(token);
      }
    }
    throw new Error(`${String(token)} not found`);
  }

  provider(token: Token): Provider | undefined {
    return this.desc.providers.find((p) => p.provide === token);
  }
}
