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
import { GetInjector } from "./meta.ts";

const log = debuglog("Injector");

export default class Injector implements Resolver {
  readonly name: string;
  readonly cache = new Map<Token, Resolved>();

  constructor(
    readonly ctr: Ctr,
    readonly md: ModuleDescriptor,
  ) {
    this.name = `${ctr.name}Injector`;
    log(`${this.name} created`);
  }

  async resolve<T>(token: Token): Promise<T> {
    const tokenName = typeof token === "function" ? token.name : String(token);
    log(`${this.name} search for "${tokenName}"`);
    // search in cache
    if (this.cache.has(token)) {
      log(`${this.name} found "${tokenName}" in cache`);
      const resolved = this.cache.get(token) as Resolved;
      resolved.refCount++;
      return resolved.value as T;
    }

    // search in providers
    const p = this.provider(token);
    if (p) {
      log(`${this.name} found "${tokenName}" in local providers`);
      const value = await p.factory(this);
      this.cache.set(token, { ...p, value, refCount: 1 });
      return value as T;
    }

    // search in imports
    for (const i of this.md.imports) {
      const inj = GetInjector(i);
      if (inj.provider(token)) {
        return inj.resolve(token);
      }
    }
    throw new Error(`${String(token)} not found`);
  }

  provider(token: Token): Provider | undefined {
    return this.md.providers.find((p) => p.provide === token);
  }
}
