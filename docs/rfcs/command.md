# RFC: Decorator Based CLI Application Framework

[[toc]]

## Summary

This RFC proposes a decorator-based command line application framework that allows developers to define controllers and
commands using decorators. The framework will support dependency injection, routing, and middlewares.

## Building Blocks

### Injectable Entity

An injectable entity is a class that can have dependencies injected into its constructor. For more details, see the
[Dependency Injection RFC](./di.md).

### Command

A command is an endpoint, method withing a controller that can be executed from the command line. Commands can have
arguments and options. The return value of the command is the application exit code, where `void` is treated as `0`.

### Controller

A controller is an **injectable** class that can have dependencies injected into its constructor. Annotated with the
`@Controller` decorator.

Controller can have a single main command or multiple sub-commands, but not both.

### Module

A module is a container for controllers. The module is an **injectable** class that can have dependencies injected into
its constructor and can register providers or import other modules. Annotated with the `@Module` decorator. The module
is the dependency injection context of its controllers.


---

## Implementation Details

Decorators will be used to define endpoints, controllers and modules. The decorators will be processed at runtime to
set up middleware and error handling.

### `@Main()` decorator

The `@Main()` decorator is used to define the main command of a controller. The main command is executed when the
controller is invoked without any sub-command.

```ts

@Controller()
class MyController {
    @Main()
    mainCommand() {
        console.log("Hello, World!");
    }
}
```

### `@Command()` decorator

The `@Command()` decorator is used to define a sub-command of a controller. The sub-command is executed when the
controller is invoked with the sub-command name.

```ts

@Controller()
class MyController {
    @Command("greet")
    greetCommand() {
        console.log("Hello, World!");
    }

    @Command("farewell")
    farewellCommand() {
        console.log("Goodbye, World!");
    }
}
```

