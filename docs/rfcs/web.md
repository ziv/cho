# RFC: Decorator Based Web Application Framework

todo missing middleware, error handling, request lifecycle, examples, testing

[[toc]]

## Summary

This RFC proposes a decorator-based web application framework that allows developers to define controllers, endpoints,
and features using decorators. The framework will support dependency injection, routing, and middleware.

## Building Blocks

### Injectable Entity

An injectable entity is a class that can have dependencies injected into its constructor. For more details, see the
[Dependency Injection RFC](./di.md).

### Routable Entity

Any entity that can be routed to, such as an endpoint, a controller or a feature. Routable entity can be associated with
an optional route path and middlewares.

### Endpoint

An endpoint is a **routable** method within a controller that handles a specific HTTP request (e.g., GET, POST).

Endpoints are asynchronous methods, resolving a plain value, a response object, or throwing an error:

| Return Type     | Behavior                                                                                          |
|-----------------|---------------------------------------------------------------------------------------------------|
| Plain value     | Serialize to JSON and send as response body with 200 status code code unless otherwise specified. |
| Response object | Used as the response.                                                                             |
| Error thrown    | Propagate to the error handler.                                                                   |

### Controller

A controller is a **routable** class that exposes a set of routes (endpoints). The controller is an **injectable** class
that can have dependencies injected into its constructor. Annotated with the `@Controller` decorator.

### Feature

A feature is a **routable** module that exposes a set of controllers and/or sub-features. The feature is an
**injectable** class that can have dependencies injected into its constructor. Annotated with the `@Feature` decorator.

## Implementation Details

Decorators will be used to define controllers, endpoints, and features. The decorators will be processed at runtime to
set up the routing and middleware.

### Endpoint Method

An endpoint method is a method within a controller that is decorated with an HTTP method decorator (e.g., `@Get`,
`@Post`).

```ts
class MyController {
    @Get("hello")
    myEndpoint() {
        return {message: "Hello, World!"};
    }
}
```

| Method    | Description               |
|-----------|---------------------------|
| `@Get`    | Defines a GET endpoint    |
| `@Post`   | Defines a POST endpoint   |
| `@Put`    | Defines a PUT endpoint    |
| `@Patch`  | Defines a PATCH endpoint  |
| `@Delete` | Defines a DELETE endpoint |

#### Context Argument

The context is always passed to the method, and it is always the last argument of the method. By default, if no extra
arguments are provided, the method will receive only the context object as its argument.

```ts
class MyController {
    @Get("hello")
    myEndpoint(ctx: Context) {
        if (condition) {
            return ctx.notFound();
        }
        return {message: "Hello, World!"};
    }
}
```

#### Input Arguments

Extracting data from the request is done via input functions. Input functions are used to define the arguments of the
endpoint method. They are passed as extra arguments to the method decorator or by adding the `@Args` decorator to the
method.

```ts
class MyController {
    @Get("hello/:name")
    @Args(Params("name"), Header('x-api-key'))
    myEndpoint(
        name: string,
        token: string,
        ctx: Context,
    ) {
        if (!token) {
            return ctx.notFound();
        }
        return {message: `Hello, ${name}!`};
    }
}
```

The following input functions are available:

| Type                        | Description                                     |
|-----------------------------|-------------------------------------------------|
| `Param(name?, validator?)`  | Extracts a path parameter from the request URL  |
| `Query(name?, validator?)`  | Extracts a query parameter from the request URL |
| `Body(name?, validator?)`   | Extracts data from request body                 |
| `Header(name?, validator?)` | Extracts a header from the request              |

#### Input Validation

Input functions can take an optional validator as the second argument. The validator is used to validate the input data,
throwing an error if the validation fails.

```ts
class MyController {
    @Get("hello/:name")
    @Args(Body(bodyValidator), Header('x-api-key', tokenValidator))
    myEndpoint(
        payload: typeof bodyValidator,
        token: string,
        ctx: Context,
    ) {
        if (!token) {
            return ctx.notFound();
        }
        return {message: `Hello, ${name}!`};
    }
}
```

The validator should be an object with a `safeParse` method that takes the input and returns an object with the
following properties:

```ts
type Validator = {
    safeParse: (input: any) => {
        success: boolean;
        data?: any;
        error?: any;
    };
};
```

* Libraries that support this interface include [Zod](https://zod.dev/), [Valibot](https://valibot.dev/), and many
  others.
* Should provide tools to convert other validation libraries to this interface.

#### HTTP Methods Decorators

Example:

```ts
class ExampleController {
    // 1. define the HTTP method and route to handle
    // 2. extract body and header from the request, apply validation on body
    // 3. the context is always the last argument
    @Post("route")
    @Args(Body(validator), Header("x-api-key"))
    handle(
        body: typeof validator,
        token: string,
        ctx: Context,
    ) {
    }
}
```

### Controller Class

A controller is a class decorated with the `@Controller` decorator that contains methods with HTTP method decorators
(`@Get`, `@Post`, etc.). Controllers have to contain at least one endpoint. Controller can define a route prefix that
will be applied to all its endpoints.

```ts

@Controller("prefix")
class MyController {
    // the full route will be /prefix/hello
    @Get("hello")
    myEndpoint() {
        return {message: "Hello, World!"};
    }
}
```

Controller can have dependencies injected into its constructor.

```ts

@Controller("prefix")
@Dependencies(MyService)
class MyController {
    constructor(readonly dep: MyService) {
    }
}

```

For more details about dependency injection, see the [Dependency Injection RFC](./di.md).

### Feature Class

A feature is a class decorated with the `@Feature` decorator that contains controllers and/or sub-features. Feature can
define a route prefix that will be applied to all its controllers and sub-features.

```ts

@Feature({
    route: "api", // optional route prefix
    features: [MySubFeature], // optional sub-features
    controllers: [MyController],
})
class MyFeature {
}

```

The feature is a module and can have its own dependencies injected into its constructor, register providers and import
other modules. See the [Dependency Injection RFC](./di.md).
