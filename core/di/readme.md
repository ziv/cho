# Dependencies Injection

The package provides a simple dependencies injection system. You can use the functional API or the simplified decorators
API.

### Provider

Provider is recipe for creating or accessing a specific value/instance.

### Module

Module is used to encapsulate dependencies injection context. Module declares providers. Module can access providers
declared by other modules by importing them.

### Injector

Injector is used to create/access instances/values of providers. Each module has its own injector. The injector caches
instances/values of providers.

---

# Resolving Dependencies

Classic DI mechanism does not instantiate the module classes. In Cho the module classes are instantiated before you can
access their injector.

The resolving process is as follows:

- Search for resolved value in injector cache
  - If found, return it
- Search for provider
  - Search for provider in current context
  - Search for provider in imported contexts
- When provider is found, create the instance/value in the **current** context and cache it
- Return the resolved value

---

## Using decorators

### @Injectable

```ts
import { Injectable } from "@cho/core/di";

@Injectable({
  // optional, list of dependencies to inject
  deps: ["foo", "bar"],
})
class MyService {
  constructor(private foo: string, private bar: number) {
    // foo and bar will be injected by the injector
  }
}
```

### @Module

Use `Module` decorator to declare a module. Module is a logic container for providers. Module can import other modules
to access their providers.

```ts
import { imports, Injectable, Module, provide } from "@cho/core/di";

@Module({
  // optional, dependencies to inject into the module constructor
  deps: [],
  // list of providers (annotated classes with Injectable or factory providers)
  providers: [
    MyService,
    {
      provide: "baz",
      useFactory: () => Promise.resolve("baz value"),
    },
  ],
  // list of modules to import
  imports: [
    OtherModule,
  ],
})
class MyModule {
}
```
