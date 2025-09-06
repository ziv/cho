---
outline: deep
---

# Injectables

We can define provider using the `@Injectable` decorator. It creates an implicit provider for us to create an instance
of the decorated class. We define the class dependencies (its constructor arguments) using the `deps` property of the
injectable decorator argument.

Example:

```ts
import { Injectable } from "@chojs/core";

@Injectable({
  deps: ["token", OtherService],
})
class SomeService {
}
```

The example above is equivalent to following example using explicit provider definition:

```ts
import { Injectable } from "@chojs/core";

@Injectable({
  deps: ["token", OtherService],
})
class SomeService {
}

const provider = {
  provide: SomeService,
  factory: async (injector) => {
    const a = await injector.resolve("token");
    const b = await injector.resolve(OtherService);
    return new SmeService(a, b);
  },
};
```
