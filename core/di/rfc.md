# DI

This RFC proposes a standard for a decorator-based dependency injection (DI) system. The primary goal is to provide a simple, yet powerful, mechanism for managing class dependencies and promoting a modular, testable, and maintainable application architecture. The system is built around decorators, modules, and a single type of provider: the factory provider.

## Core Concepts and Terminology

- *Dependency Injection (DI):*  A software design pattern that gives objects their dependencies, rather than having the objects create their own dependencies. This inverts the control, making components more loosely coupled.
- *Decorator:* A function that takes a class or method as input and returns a new version of it, often by adding metadata or modifying its behavior.
- Provider: An object that knows how to create and provide an instance of a dependency. In this system, we use only factory providers.
- Module: A logical grouping of related providers. A module defines a DI context, encapsulating the dependencies it can provide to other parts of the application.
- Injector: The core mechanism that resolves and instantiates dependencies. An injector is responsible for looking up a provider within a module's context and creating an instance of the requested dependency. There is a one-to-one relationship between a module and an injector.
