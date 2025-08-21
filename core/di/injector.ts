import type { Any, Ctr, Resolver, Token } from "./types.ts";
import { getInjector, getModule, type ModuleDescriptor } from "./fn.ts";

export default class Injector implements Resolver {
  readonly md: ModuleDescriptor;
  readonly cache = new Map<Token, Any>();

  constructor(readonly ctr: Ctr) {
    this.md = getModule(ctr);
  }

  async resolve<T>(token: Token): Promise<T> {
    let ret = await this.search<T>(token);
    if (ret.status) {
      return ret.value as T;
    }
    // search in imports
    for (const imp of this.md.imports) {
      ret = await getInjector(imp).search(token);
      if (ret.status) {
        return ret.value as T;
      }
    }
    throw new Error(`${String(token)} not found`);
  }

  // search
  async search<T>(
    token: Token,
  ): Promise<{ status: boolean; value: T | Error | undefined }> {
    if (this.cache.has(token)) {
      return {
        status: true,
        value: this.cache.get(token) as T,
      };
    }
    for (const provider of this.md.providers) {
      if (provider.provide === token) {
        try {
          const value = await provider.factory(this);
          this.cache.set(token, value);
          return {
            status: true,
            value,
          };
        } catch (e) {
          return {
            status: true,
            value: e as Error,
          };
        }
      }
    }
    return {
      status: false,
      value: undefined,
    };
  }
}
