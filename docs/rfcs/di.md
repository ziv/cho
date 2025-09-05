---
outline: [ 2, 4 ]
---

# RFC: Decorator-based Dependency Injection

::: details Properties

<table class="properties">
    <tbody>
        <tr>
            <th>Status</th>
            <td>Draft</td>
        </tr>
        <tr>
            <th>Created</th>
            <td>2025-08-01</td>
        </tr>
        <tr>
            <th>Target</th>
            <td>TypeScript (ECMAScript decorators)</td>
        </tr>
        <tr>
            <th>Authors</th>
            <td>XPR</td>
        </tr>
    </tbody>
</table>

:::

[[toc]]

## Summary

Introduce a decorator-based dependency injection (DI) system with the following core principles:

1. Decorator-based APIs for declaring injectable classes and modules.
2. A single provider type: the factory provider.
3. Modules encapsulate DI contexts, declaring which providers they can provide.
4. Modules can import other modules to access their providers.
5. Each module has its own injector; resolution logic lives in the injector.
6. Classes can be annotated as injectable using `@Injectable`.
7. Classes can be annotated as modules using `@Module`.

This RFC specifies the programming model, resolution semantics, and a minimal runtime API.

## Motivation

- Provide a simple, explicit DI system without the complexity of multiple provider types.
- Enable modular composition: each module has its own provider registry (DI context) and can import other modules.
- Support testability and configurability via provider overrides at the module level.
- Keep the mental model small: factory only, module-scoped injectors, decorator-driven registration.
- Cross-runtime support beyond modern TypeScript/JavaScript environments that support decorators.

## Non-Goals

- Multiple provider kinds (e.g., class, value, alias). Only factory providers are supported.
- Advanced features such as hierarchical scoping beyond modules, multi-bindings, or interceptors.

## Terminology

- **Token**: The key used to look up a dependency. Typically, a class constructor or a unique identifier.
- **Factory** Provider: A provider that supplies a value by invoking a factory function.
- **Module**: A class annotated with `@Module` that declares providers and imports.
- **Injector**: A per-module dependency resolver/registry.
- **Injectable**: A class annotated with `@Injectable` that can be constructed and injected.

## Design Overview

- The system revolves around modules. Each module class annotated with `@Module` has:
    - A list of factory providers it declares.
    - A list of other modules it imports to gain access to their providers.
- An injector is instantiated per module class. It contains:
    - The module’s own providers.
    - Views on imported modules’ injectors for transitive resolution.
    - The resolution algorithm and instance cache (by default, per-injector singletons).
- `@Injectable` marks a class as eligible for DI. It implies an implicitly registered factory provider for that class:
    - Default factory: `() => new C(...resolvedDeps)` using dependency parameter tokens (`dependsOn` function).
- Only factory providers exist:
    - Factories get the injector as an argument to resolve dependencies.
    - Factories must return a future value (promise).
    - Factories may construct classes (including `@Injectable` classes) or compute values.

## Core Concepts

### Tokens

Tokens identify dependencies. They can be class constructors (e.g., `class Foo {}`, `Foo` as token) or `symbol` or
`string`.

##### Token Definition:

```ts
type Ctr = new (...args: any[]) => any;
type Token = Ctr | symbol | string;
```

### Factory Provider

The factory provider is the sole provider type. It defines how to create an instance for a given token.

##### Factory Provider Definition:

```ts
type FactoryProvider<T = any> = {
    token: Token;
    factory: (injector: Injector) => Promise<T>;
};
```

Notes:

- As the only provider type, all values—including class instances and primitives are supplied through `factory`.
- For convenience, `@Injectable()` classes get an implicit factory provider unless overridden in the module.

### Injectable Decorator

Marks a class as injectable and eligible for implicit factory creation:

##### `@Injectable` Decorator Definition:

```ts
type InjectableDescriptor = {
    deps?: Token[];
};

function Injectable(d: InjectableDescriptor) {
}
```

- `deps`: List of tokens for the constructor arguments.

Example:

```ts
// example with dependencies
@Injectable({
    deps: [Foo],
})
class MyService {
    constructor(readonly foo: Foo) {
    }
}
```

By default, the system will:

- Treat the class constructor as the token.
- Generate an implicit factory: `factory: (inj) => new C(...deps)`.

### Module Decorator

Mark a class as a DI context.

##### `@Module` Decorator Definition:

```ts
type ModuleDescriptor = InjectableDescriptor & {
    imports: Ctr[];
    providers: (Provider | Ctr)[];
};

function Module(d: ModuleDescriptor): ClassDecorator {
}
```

- `providers`: Factory providers declared by this module.
- `imports`: Other modules whose providers are visible to this module.
- `deps`: see `@Injectable`.
- All imported module providers are visible; no separate export list in this initial design.

Example:

```ts

@Injectable({
    deps: [Foo],
})
class MyService {
    constructor(readonly foo: Foo) {
    }
}

// set the service from previous example in a module (di context)
@Module({
    providers: [MyService],
})
class MyModule {
}

// is equivalent to
@Module({
    providers: [
        {
            token: MyService,
            factory: async (inj) => {
                const foo = await inj.resolve(Foo);
                return new MyService(foo);
            },
        },
    ],
})
```

### Injector

The injector is responsible for resolving tokens to instances. Each module has its own injector, and creating an
injector cause the module to instantiate while resolving its dependencies.

- The injector search imported modules’ injectors for resolution.
- The injector caches a module’s singleton instances by token.
- Global singletons can be archived using self injection.
- Throws if a token cannot be resolved.

##### `Injector` Definition:

```ts
interface Injector {
    resolve<T>(token: Token): Promise<T>;
}
```

- Resolve tokens using local providers first, then imported modules’ providers.
- Cache singleton instances per injector by token.
- Create instances for `@Injectable` classes via implicit factories when no explicit provider exists.
- Detect and report circular dependencies.

---

## Error Handling (TBD, TBC)

- Missing token:
    - Throw: `No provider for Token X (required by Y -> Z -> X)`
- Circular dependency:
    - Throw: `Circular dependency detected: A -> B -> A`
- Duplicate local providers for the same token:
    - Last-one-wins or fail-fast; this RFC recommends fail-fast for clarity.
