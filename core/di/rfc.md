# RFC: Decorator-based Dependency Injection with Module-Scoped Injectors and Factory Providers

- Status: Draft
- Authors: Ziv
- Created: 2025-08-01
- Target: TypeScript (ECMAScript decorators)

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

- Token: The key used to look up a dependency. Typically, a class constructor or a unique identifier.
- Factory Provider: A provider that supplies a value by invoking a factory function.
- Module: A class annotated with `@Module` that declares providers and imports.
- Injector: A per-module dependency resolver/registry.
- Injectable: A class annotated with `@Injectable` that can be constructed and injected.

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

Tokens identify dependencies. They can be:

- Class constructors (e.g., `class Foo {}`, `Foo` as token).
- `symbol` or `string`.

### Factory Provider

Shape:

```ts

type Ctr = new (...args: any[]) => any;
type Token = Ctr | symbol | string;

type FactoryProvider<T = any> = {
    token: Token;
    useFactory: (injector: Injector) => Promise<T>;
}

```

Notes:

- As the only provider type, all values—including class instances, primitives, configs—are supplied through
  `useFactory`.
- For convenience, `@Injectable()` classes get an implicit factory provider unless overridden in the module.

### @Injectable Decorator

Marks a class as injectable and eligible for implicit factory creation:

```ts

/**
 * Decorator to mark a class as injectable.
 * @param fns
 * @constructor
 */
function Injectable(...fns: DescriptorFn[]) {
}
```

Example:

```ts

@Injectable({
    deps: [Foo]
})
class MyService {
    constructor(readonly foo: Foo) {
    }
}

@Module({
    providers: [MyService]
})
class MyModule {
}
```

By default, the system will:

- Treat the class constructor as the token.
- Generate an implicit factory: `useFactory: (inj) => new C(...deps)`.
- Determine `deps` from parameter design types if available, or via explicit parameter decorators like `@Inject(token)`.

Optional parameter decorator:

```ts
function Inject(token: Token): ParameterDecorator { /* overrides constructor param token */
}
```

Note: If `emitDecoratorMetadata` is not enabled, `@Inject` becomes necessary for non-class tokens.

### @Module Decorator

Declares a DI context:

```ts
interface ModuleOptions {
    providers?: FactoryProvider[];
    imports?: ModuleType[];
}

type ModuleType = new (...args: any[]) => any;

function Module(options: ModuleOptions): ClassDecorator { /* stores metadata */
}
```

- `providers`: Factory providers declared by this module.
- `imports`: Other modules whose providers are visible to this module.

All imported module providers are visible; no separate export list in this initial design.

### Injector

Created per module:

```ts
interface Injector {
    get<T>(token: Token<T>): T;

    // Optional async variant if needed:
    // getAsync<T>(token: Token<T>): Promise<T>;
}
```

Responsibilities:

- Resolve tokens using local providers first, then imported modules’ providers.
- Cache singleton instances per injector by token.
- Create instances for `@Injectable` classes via implicit factories when no explicit provider exists.
- Detect and report circular dependencies.

## Provider Resolution Semantics

1. Lookup order:
    - Local providers (declared on the module).
    - Implicit providers for local `@Injectable` classes used as tokens.
    - Imported modules’ providers (depth-first or breadth-first; this RFC specifies depth-first).
    - Implicit providers for imported `@Injectable` classes.
2. Precedence:
    - Local providers override imported providers with the same token.
3. Caching:
    - Default is per-injector singleton caching. A token resolved within a module yields the same instance for that
      module’s injector.
4. Asynchrony:
    - Factories may return promises; `getAsync` would unwrap them. The initial surface can start sync-only and extend
      later if needed.
5. Cycles:
    - Circular dependencies are detected via resolution stack tracking.
    - Error includes the token chain (e.g., A -> B -> A).
6. Missing tokens:
    - Resolution error clearly lists the missing token and the chain that required it.

## API Specification (Draft)

Types:

```ts
export type Token<T = any> = new (...args: any[]) => T | InjectionToken<T>;

export interface FactoryProvider<T = any> {
    token: Token<T>;
    useFactory: (injector: Injector) => T | Promise<T>;
}

export interface Injector {
    get<T>(token: Token<T>): T;
}

export interface ModuleOptions {
    providers?: FactoryProvider[];
    imports?: ModuleType[];
}

export type ModuleType = new (...args: any[]) => any;

// Decorators
export declare function Injectable(): ClassDecorator;

export declare function Inject(token: Token): ParameterDecorator;

export declare function Module(options: ModuleOptions): ClassDecorator;

// Runtime
export declare function createInjectorForModule(moduleType: ModuleType): Injector;
```

Behavioral notes:

- `createInjectorForModule`:
    - Constructs an injector for the given module type.
    - Recursively constructs injectors for imported modules.
    - Registers local and implicit providers.
- Implicit provider generation for `@Injectable`:
    - If `C` is annotated with `@Injectable` and no explicit provider is present for token `C`, register:
        - `{ token: C, useFactory: (inj) => new C(...resolveDeps(C))) }`.
- Dependency inference:
    - With `emitDecoratorMetadata`, use `Reflect.getMetadata('design:paramtypes', C)`.
    - Otherwise, rely on `@Inject` parameter decorators for non-class tokens.

## Examples

### 1) Basic Injectable and Module

```ts

@Injectable()
class Logger {
    log(msg: string) {
        console.log(msg);
    }
}

@Injectable()
class Greeter {
    constructor(private logger: Logger) {
    }

    greet(name: string) {
        this.logger.log(`Hello, ${name}!`);
    }
}

@Module({
    providers: [], // Implicit providers for Logger and Greeter will be available when requested
    imports: [],
})
class AppModule {
}

const injector = createInjectorForModule(AppModule);
const greeter = injector.get(Greeter);
greeter.greet('World');
```

### 2) Factory Provider for Configuration

```ts
const APP_NAME = new InjectionToken<string>('APP_NAME');

@Module({
    providers: [
        {
            token: APP_NAME,
            useFactory: () => 'MyApp',
        },
    ],
})
class ConfigModule {
}

@Injectable()
class Banner {
    constructor(@Inject(APP_NAME) private appName: string) {
    }

    text() {
        return `Welcome to ${this.appName}`;
    }
}

@Module({
    imports: [ConfigModule],
})
class FeatureModule {
}

const inj = createInjectorForModule(FeatureModule);
console.log(inj.get(Banner).text()); // Welcome to MyApp
```

### 3) Overriding a Provider in a Test Module

```ts
const NOW = new InjectionToken<Date>('NOW');

@Module({
    providers: [
        {token: NOW, useFactory: () => new Date()},
    ],
})
class TimeModule {
}

@Injectable()
class Clock {
    constructor(@Inject(NOW) private now: Date) {
    }

    value() {
        return this.now;
    }
}

@Module({
    imports: [TimeModule],
})
class AppModule {
}

// Test override
@Module({
    providers: [
        {token: NOW, useFactory: () => new Date('2000-01-01T00:00:00Z')},
    ],
    imports: [AppModule],
})
class TestModule {
}

const inj = createInjectorForModule(TestModule);
console.log(inj.get(Clock).value().toISOString()); // 2000-01-01T00:00:00.000Z
```

## Error Handling

- Missing token:
    - Throw: `No provider for Token X (required by Y -> Z -> X)`
- Circular dependency:
    - Throw: `Circular dependency detected: A -> B -> A`
- Duplicate local providers for the same token:
    - Last-one-wins or fail-fast; this RFC recommends fail-fast for clarity.

## Implementation Sketch

- Metadata storage:
    - Use WeakMaps keyed by class constructors for `@Injectable` and `@Module` data.
    - Use `reflect-metadata` for param types when available.
- Injector internals:
    - Map<Token, ProviderRecord> where ProviderRecord stores factory and instance cache.
    - Resolution:
        - Try local map, then implicit `@Injectable`, then imported injectors in order.
        - Track a resolution stack array for diagnostics.
- Imports:
    - Construct child injectors for each imported module once and reuse them.
    - Visibility: imported providers are read-only from the importing module’s perspective.

## Rationale

- Factory-only keeps the system small and powerful; class/value providers are syntactic sugar over factories and can be
  added later if needed.
- Per-module injectors match the module-as-DI-context requirement and simplify overrides and testing.
- Decorators provide a declarative way to register and compose DI metadata.

## Alternatives Considered

- Multiple provider kinds (class/value/alias): increases API surface; not necessary to meet requirements.
- Global singleton injector: breaks modular encapsulation and makes testing harder.
- Required explicit tokens for all params: too verbose; decorator metadata plus `@Inject` strikes a balance.

## Open Questions

- Async support: Should `get` be sync-only, and we provide `getAsync` for async factories?
- Caching policy: Do we need a way to opt-out of singleton caching at this stage?
- Import precedence ordering: Depth-first vs breadth-first lookup; this RFC proposes depth-first—should this be
  configurable?

## Appendix: Minimal Type Declarations

```ts
// tokens.ts
export class InjectionToken<T = unknown> {
    constructor(public readonly description: string | symbol) {
    }

    toString() {
        return `InjectionToken(${String(this.description)})`;
    }
}

// decorators.ts
export function Injectable(): ClassDecorator { /* ... */
}

export function Inject(token: Token): ParameterDecorator { /* ... */
}

export function Module(options: ModuleOptions): ClassDecorator { /* ... */
}

// runtime.ts
export function createInjectorForModule(moduleType: ModuleType): Injector { /* ... */
}
```
