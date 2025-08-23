# CHO

Under development - not production ready!

## About Javascript Decorators

This package use the TC39 stage 3 decorators proposal (JavaScript decorators).

The JavaScript decorators are different from TypeScript decorators, and they are
not compatible with each other. For more information, see:

- [decorators.deno.dev](https://decorators.deno.dev/)
- [Typescript Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)
- [TC39 stage 3 proposal](https://github.com/tc39/proposal-decorators)

<img src="./assets/cho.svg"  alt="CHO" width="200"/>

## Cho

A tiny **_decorators_** based framework for applications. The concept is
inspired by Angular, NestJS, and Spring but with a different approach:

### Standard

Use the language standard features (or in our case, stage 3 decorators proposal
with implementation).

### Engine Agnostic

The framework does not depend on any engine and on the environment (Node.js,
Deno, Bun, Browser, etc.).

### Minimal

Provide a shallow set of features, enough to build a modular application.

---

## Dependencies Injection

Module is a logical unit to provide dependencies. A module can import other
modules to use their provided dependencies.

```ts

@Module(
    // importing
    Imports(FooModule, BarModule),
    // provide by an async factory function
    Provide("token", (i: Injector) => Promise.resolve("factory value")),
    // provide by a class
    Provide(MyService),
)
class MyModule {
}
```

Defining a class as injectable entity:

```ts

@Injectable(
    // dependencies (list of tokens for the constructor arguments)
    DependsOn(OtherService, "foo"),
)
class MyService {
    constructor(
        readonly other: OtherService,
        readonly foo: string,
    ) {
    }
}
```

#### Example

An Angular like example:

```ts

@Injectable()
class Service {
    // this type of decorator (argument decorator) does not
    // exists in JS decorators
    constructor(
        @Inject() private dep: Dep,
        @Inject("config") private config: Config,
    ) {
    }
}
```

Lack of this feature in JS decorators requires a different approach - being more
verbose. With `CHO`, defining dependencies is done using the `dependsOn()`
function in the class decorator.

```ts
import {dependsOn, Injectable} from "@cho/core/di";

@Injectable(dependsOn(Dep, "config"))
class Service {
    constructor(private dep: Dep, private config: Config) {
    }
}
```
