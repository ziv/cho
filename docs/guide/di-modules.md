# Modules

Modules represent DI contexts, encapsulating a set of providers and their resolution logic. We define a module using the
`@Module` decorator. Module is an injectable entity itself, so we can define dependencies for it using the `deps`
property of the `@Module` decorator argument.

Registering providers in a module makes them available for resolution within that module and any modules that import it.
We can register explicit providers or use the `@Injectable` decorator to create implicit providers.

The module can import other modules, allowing you to compose your application from smaller, reusable pieces. The
injector will look for providers in the current module first, then in the imported modules' injectors if the provider is
not found.

Example:

```ts
import { Injectable, Module } from "@chojs/core";

@Injectable()
class Service {
  constructor(private readonly apiService: ApiService) {
  }
}

@Module({
  // module dependencies
  deps: [Service],

  // module imports (other modules)
  imports: [OtherModule],

  // registering providers
  providers: [
    Service,
    {
      provide: ApiService,
      factory: async (injector) => {
        const config = await injector.resolve("Config");
        return new ApiService(config.apiUrl);
      },
    },
  ],
})
class MyModule {
  constructor(private readonly service: Service) {
  }
}
```
