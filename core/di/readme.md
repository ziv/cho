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

# Resolving Dependencies

Classic DI mechanism does not instantiate the module classes. In Cho the module
classes are instantiated before you can access their injector.

```
+----------+              +----------+
| ModuleA  | --imports--> | ModuleB  |
+----------+              +----------+ 
| ServiceA |              | ServiceB |
+----------+              +----------+
```

If `ServiceA` depends on `ServiceB`, the injector of `ModuleA` will resolve
`ModuleB` to access its injector, and then it can ask for `ServiceB`.

---

## Using decorators

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
