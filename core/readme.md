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

The core module provides a robust and flexible Dependency Injection (DI) system. Using minimal set of decorators and,
you can define and manage dependencies in your application with ease.

Example for dependency injection configuration using decorators:

```ts
import {Imports, Injectable, Injector, Module} from "@cho/core/di";

@Injectable({
    deps: ["foo", "bar"],
})
class ServiceFoo {
    constructor(readonly foo: string, readonly bar: string) {
    }
}

@Module({
    providers: [
        ServiceFoo,
        {provide: "foo", usFactory: () => Promise.resolve("Hello")},
        {provide: "bar", usFactory: () => Promise.resolve("World")},
    ],
})
class ModuleFoo {
}

const injector = await Injector.create(ModuleFoo);
const value = await injector.resolve(ServiceFoo);
```

## Utilities

Environment variable utilities to seamlessly work across Deno, Bun, Cloudflare and Node.js runtimes.

Environment variable utilities:

```ts
import { env, envbool, envnum } from "@cho/core/utils";

// `env` returns the value of the environment variable as a string or `undefined` if not set.
const dbHost = env("DB_HOST") ?? "localhost";

// `envnum` returns the value of the environment variable as a number or `undefined` if not set or not a valid number.
const port = envnum("PORT") ?? 3000;

// `envbool` returns the value of the environment variable as a boolean interpreting "1", "true", "yes", "on" (case-insensitive) as true.
const isProduction = envbool("PRODUCTION");
```
