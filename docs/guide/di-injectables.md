---
outline: deep
---

# Injectables

We can define provider using the `@Injectable` decorator. It creates an implicit provider for us to create an instance
of the decorated class. We define the class dependencies (its constructor arguments) using the `deps` property of the
injectable decorator argument or using the `@Dependencies` decorator.

In the following examples, we define a service class `SomeService` that depends on a value identified by the token
`"token"` and another service identified by the token `OtherService`, which is the class name of another injectable
service.

Example using `deps` property:

```ts
import {Injectable, Dependencies} from "@chojs/core";

@Injectable({
    deps: ["token", OtherService],
})
class SomeService {
    constructor(readonly token: string,
                readonly service: OtherService) {
    }
}

```
Example using `@Dependencies` decorator:

```ts
import {Injectable, Dependencies} from "@chojs/core";

@Injectable()
@Dependencies("token", OtherService)
class SomeService {
    constructor(readonly token: string,
                readonly service: OtherService) {
    }
}
```



The example above is equivalent to following example using explicit provider definition:

```ts
import {Injectable} from "@chojs/core";

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
        return new SomeService(a, b);
    },
};
```
