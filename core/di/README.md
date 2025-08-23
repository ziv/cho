# Dependencies Injection

The package provides a simple dependencies injection system. You can use the
functional API or the simplified decorators API.

### Provider

Provider is recipe for creating or accessing a specific value/instance.

### Module

Module is used to encapsulate dependencies injection. Module declares providers.
Module can access providers declared by other modules by importing them.

### Injector

Injector is used to create/access instances/values of providers. Each module has
its own injector. The injector caches instances/values of providers.

---

## Using decorators

### @Injectable

Use this decorator to declare a provider. The provider can be a class or a
function.

```ts
import { dependsOn, Injectable } from "@cho/core/di";

@Injectable(dependsOn("foo", "bar"))
class MyService {
  constructor(private foo: string, private bar: number) {
    // foo and bar will be injected by the injector
  }
}
```

### @Module

Use this decorator to declare a module. The module can import other modules and
declare providers. All required dependencies should be declared or imported.

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
