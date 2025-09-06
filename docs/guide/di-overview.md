# Dependency Injection

**CHO** provide a simple and flexible [Dependency Injection](https://en.wikipedia.org/wiki/Dependency_injection) (DI)
system
to manage the creation and sharing of entities within your application.
DI is a design pattern that allows a class to receive its dependencies from an external source rather than creating them
itself. This promotes loose coupling and makes your code more modular, testable, and maintainable. This guide will walk
you through the key concepts and usage of DI in **CHO**.

The DI in **CHO** is achieved through [providers](di-providers.md) definitions. A provider is a recipe for creating an
entity. Providers are registered in a DI container (the module), and each [module](di-modules.md) contain an injector
which is responsible for managing the resolution of dependencies.

Module can import other modules, allowing you to compose your application from smaller, reusable pieces.
The injector will look for providers in the current module first, then in the imported modules injectors if the provider
is not found.

<img class="excalidraw" src="../public/module.svg">

The DI in **CHO** supports only single type of provider, the factory provider. A factory provider is defined by a token
and
a factory function that receive injector as argument for resolving dependencies, and returns the resulting entity. The
factories in **CHO** are always asynchronous.

Here is an example of defining and using providers in **CHO**:

```ts
import {Module, Injectable} from '@chojs/core';

@Injectable()
class Service {
}

@Module({
    // registring providers 
    providers: [
        // implicit provider definition
        Service,
        // explicit providers definition
        {
            provide: 'Config',
            useFactory: (injector) => {
                return Promise.resolve({apiUrl: 'https://api.example.com'});
            }
        },
        {
            provide: ApiService,
            useFactory: async (injector) => {
                const config = await injector.resolve('Config');
                return new ApiService(config.apiUrl);
            }
        }
    ]
})
class AppModule {
}
```
