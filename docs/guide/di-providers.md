---
outline: deep
---

# Providers

Providers are a core concept in **CHO**'s Dependency Injection (DI) system. They define how to create entities.

### Factory Providers

**CHO** DI supports only a single type of provider: the factory provider. The provider is an object containing `provide`
and `factory` properties.

The `provide` property is a **token** that identifies the entity. It can be a **class**, a **string**, or a **symbol**.

The `factory`property is an **async function** that returns promise that resolve the entity. The factory function gets
an injector as an argument. This injector can be used to resolve other dependencies.

Example:

```ts
import type { Provider } from "@chojs/core";

const myProvider: Provider = {
  provide: MyService,
  factory: async (injector) => {
    const dep1 = await injector.resolve(Dep1);
    const dep2 = await injector.resolve(Dep2);
    return new MyService(dep1, dep2);
  },
};
```

---

### Providing Techniques

Since there is only single type of provider, there are techniques to achieve different behaviors.

#### Value Providers

Value providers are used to provide a constant value. The factory function simply returns the value. Note that the
factory function must be async and return a promise event for non-async values.

```ts
const valueProvider: Provider = {
  provide: "API_URL",
  factory: () => Promise.resolve("https://api.example.com"),
};
```

#### Class Providers

Class providers are used to create overrides for classes (create instance of class A as class B). In **CHO**, instead of
using class provider, create a provider that resolve the override instance.

```ts
const classProvider: Provider = {
  provide: MyService,
  factory: async (injector) => {
    return injector.resolve(OtherService);
  },
};
```

#### Existing Providers

Existing providers are used to create aliases for existing providers. In **CHO**, instead of using existing provider,
create a provider that resolve the existing provider. See the example of class provider above.
