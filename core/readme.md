# @chojs/core

Core utilities for `cho` framework.

| Component            | Documentation        |
| -------------------- | -------------------- |
| Dependency Injection | [DI](./di/readme.md) |

## Installation

```
deno add chojs/core
```

## Dependency Injection Using decorators

### @Injectable

Use `Injectable` to declare a class as a provider. Use `DependsOn` to declare
its dependencies.

```ts
import { DependsOn, Injectable } from "@cho/core/di";

@Injectable(DependsOn("foo", "bar"))
class MyService {
  constructor(private foo: string, private bar: number) {
    // foo and bar will be injected by the injector
  }
}
```

### @Module

Use `Module` decorator to declare a module. Module is a logic container for
providers. Module can import other modules to access their providers.

```ts
import { imports, Injectable, Module, provide } from "@cho/core/di";

@Module(
  imports(OtherModule),
  provide("foo", () => "bar"),
  provide(MyService),
)
class MyModule {
}
```
