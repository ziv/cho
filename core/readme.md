# @chojs/core

Core modules for `cho` framework.

| Modules                                |
| -------------------------------------- |
| [Dependency Injection](./di/readme.md) |
| [Utilities](./utils/readme.md)         |

## Installation

```
deno add jsr:@chojs/core
```

## Usage

See the readme files of each module for usage instructions.

## Dependency Injection (DI) System

The core module provides a robust and flexible Dependency Injection (DI) system. Using minimal set of decorators and
various functions, you can define and manage dependencies in your application with ease.

Dependency Injection Configuration using Decorators:

```ts
import { DependsOn, Imports, Injectable, Injector, Module, Provide } from "@cho/core/di";

@Injectable(DependsOn("bar", "foo"))
class ServiceFoo {
  constructor(readonly foo: string, readonly bar: string) {
  }
}

@Module(
  Provide("foo", () => Promise.resolve("Bar Value")),
  Provide("bar", () => Promise.resolve("Bar Value")),
  Provide(ServiceFoo),
)
class ModuleFoo {
}

const injector = new Injector(ModuleFoo);
const value = await injector.resolve(ServiceFoo);
```

## Utilities

Environment variable utilities to seamlessly work across Deno, Bun, Cloudflare and Node.js runtimes.

Environment variable utilities:

```ts
import { env, envbool, envnum } from "@cho/core/utils";

// `env` returns the value of the environment variable as a string or `undefined` if not set.
const dbHost = env("DB_HOST") ?? "localhost";

// `envnum` returns the value of the environment variable as a number or `NaN` if not set or not a valid number.
const port = envnum("PORT") ?? 3000;

// `envbool` returns the value of the environment variable as a boolean interpreting "1", "true", "yes", "on" (case-insensitive) as true.
const isProduction = envbool("PRODUCTION");
```
