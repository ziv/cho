// deno-lint-ignore no-explicit-any
export type Any = any;
export type Ctr<T = Any> = new (...args: Any[]) => T;
export type Token = string | symbol | Ctr;

export type Resolver = { resolve: (token: Token) => Promise<Any | undefined> };
export type Factory<T = Any> = (injector: Resolver) => T;

export type Provider<T = Any> = {
  provide: Token;
  factory: Factory<T>;
};
