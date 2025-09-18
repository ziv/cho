# Specifications: Decorator Based CLI Application Framework

<table class="properties">
    <tbody>
        <tr>
            <th>Status</th>
            <td>in progress</td>
        </tr>
        <tr>
            <th>Created</th>
            <td>2025-08-21</td>
        </tr>
        <tr>
            <th>Target</th>
            <td>TypeScript (ECMAScript decorators)</td>
        </tr>
    </tbody>
</table>

[[toc]]

## Summary

This document proposes a decorator-based command line application framework that allows developers to define controllers
and
commands using decorators. The framework will support dependency injection, routing, and middlewares.

## Building Blocks

### Injectable Entity

An injectable entity is a class that can have dependencies injected into its constructor. For more details, see the
[Dependency Injection RFC](./di.md).

### Command

A command is an endpoint, method withing a controller that can be executed from the command line. Commands can have
arguments and options from the CLI.

### Controller

A controller is a class annotated with `@Controller` decorator. The controller an **injectable** class that can have
dependencies injected into its constructor.

Controller can have a single entry (main command endpoint) or multiple entries (sub-commands), but not both.

### Module

A module is a class annotated with `@Module` decorator. The module is the DI context for its controllers. The module is
an **injectable** class that can have dependencies injected into its constructor and can register providers or import
other modules.

---

## Implementation Details

Decorators will be used to define endpoints, controllers and modules. The decorators will be processed at runtime to
set up middleware and error handling.

### Endpoint/Command Method

The method get a `ChoCommandContext` as an argument that contains the command line arguments and options (minimist API).
The return value of the command is the application exit code, where `void` is treated as `0`.

### `@Main()` decorator

The `@Main()` decorator is used to define the main command of a controller. The main command is the only endpoint of the
controller.

```ts twoandhalfs

class MyController {
    @Main()
    mainCommand() {
        console.log("Hello, World!");
    }
}
```

### `@Command()` decorator

The `@Command()` decorator is used to define a multi-command of a controller. The sub-command is executed when the
controller is invoked with the sub-command name.

```ts

class MyController {
    @Command("greet")
    greet() {
        console.log("Hello, World!");
    }

    @Command("farewell")
    farewell() {
        console.log("Goodbye, World!");
    }
}
```

### The Controller

A controller is a class annotated with the `@Controller` decorator. The controller is an injectable class that can have
dependencies injected into its constructor.

The controller implement the endpoints of the application. Each endpoint is a method within the controller that is
decorated with either the `@Main()` or `@Command()` decorator.

```ts

@Controller()
class MyController {
}
```

### The Application Module

The application module is the root module of the application. It is a class annotated with the `@Module` decorator. The
application module is an injectable class that can have dependencies injected into its constructor and can register
providers or import other modules.

The application module is the dependency injection context of its controllers.

```ts

@Module({
    imports: [SomeModule],
    controllers: [MyController, AnotherController], //^ u^-250,30^single controller in case of main
})
class AppModule {
}
```

### Application Limitations

Application can have either a main command or multiple sub-commands, but not both:

- The program `ls` is an example of a controller with a main command.
- The program `git` is an example of a controller with multiple sub-commands.

### Routing

The routing is based on the command name. If the application implemented the main command, the command is executed
when the application is invoked with any arguments.

```shell
# call the main command
app arg1 arg2 --flag
```

If the application implemented multiple sub-commands, the application is invoked with the sub-command name as the first
argument.

```shell
# call the arg1 command
app arg1 arg2 --flag
```

### Middlewares

See middlewares in the [Application Lifecycle RFC./lifecycle.md).

The middlewares are functions that are executed before and after the command is executed. The signature of a middleware
is:

```ts
type Middleware = (
    context: ChoCommandContext,
    next: () => Promise<void>,
) => Promise<void>;
```

The `context` parameter is the command context, which contains the command line arguments and options. The `next`
parameter is a function that executes the next middleware in the chain.

Middlewares can be applied globally to all commands (module or controller) or to specific commands (method).

For middlewares require dependencies, implement the `ChoMiddleware` interface:
