# RFC: Decorator Based Web Application Framework

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
| --------------- | ------------------------------------------------------------------------------------------------- |
| Plain value     | Serialize to JSON and send as response body with 200 status code code unless otherwise specified. |
| Response object | Used as the response.                                                                             |
| Error thrown    | Propagate to the error handler.                                                                   |

### Controller

A controller is a **routable** class that exposes a set of routes (endpoints). The controller is an **injectable** class
that can have dependencies injected into its constructor.

### Feature

A feature is a **routable** module that exposes a set of controllers and/or sub-features. The feature is an
**injectable** class that can have dependencies injected into its constructor.

## Implementation Details

Decorators will be used to define controllers, endpoints, and features. The decorators will be processed at runtime to
set up the routing and middleware.

### Input Decorators

Since we are dealing with JS decorators, we cannot set decorators on method arguments directly. Instead, we will use
extra arguments in the input decorator to define list of inputs we want to add our endpoint.

Definition:

```ts
type Method = (route: string, args: MethodArgType = []) => MethodDecorator;
```

#### Context Argument

The context is always passes to the method, and it is always the last argument of the method. By default, if no extra
arguments provided, the method will receive only the context object as its argument.

#### Input Arguments

We can use any of the following input arguments function to extract specific parts of the request and validate them if a
validator is provided.

| Type                        | Description                                       |
| --------------------------- | ------------------------------------------------- |
| `Param(name?, validator?)`  | Extracts a path parameter from the request URL    |
| `Query(name?, validator?)`  | Extracts a query parameter from the request URL   |
| `Body(name?, validator?)`   | Extracts data from request body                   |
| `Header(name?, validator?)` | Extracts a header from the request                |
| `Cookie(name, validator?)`  | Extracts a cookie from the request                |
| `Context`                   | The context object                                |
| `RawRequest`                | The raw request object                            |
| `RawResponse`               | The raw response object                           |

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

Libraries support this interface include Zod, Yup, Joi, Valibot, and many others.

#### HTTP Methods Decorators

| Method    | Description               |
| --------- | ------------------------- |
| `@Get`    | Defines a GET endpoint    |
| `@Post`   | Defines a POST endpoint   |
| `@Put`    | Defines a PUT endpoint    |
| `@Patch`  | Defines a PATCH endpoint  |
| `@Delete` | Defines a DELETE endpoint |

Example:

```ts
class ExampleController {
  @Post("route", [
    Body(validator),
    Header("x-api-key"),
    Cookie("session_id"),
  ])
  handle(
    body: typeof validator,
    key: string,
    sessionsId: string,
    ctx: ChoContext, // the context is always the last argument
  ) {
  }
}
```

#### Other Input Decorators

| Decorator    | Description                 |
| ------------ | --------------------------- |
| `@Sse`       | Server-Sent Events endpoint |
| `@WebSocket` | WebSocket endpoint          |
| `@Stream`    | Stream endpoint             |

Each of these decorators explained in its own RFC document as extensions to this base framework.

### Middlewares Decorator

Takes a list of middlewares to be applied to the feature, controller or endpoint. Middlewares are executed in the order
they are defined. Middleware can be either a function or an injectable class that implements the `ChoMiddleware`
interface.

Definition:

```ts
type Middlewares = (...middlewares: (Function | ChoMiddleware)[]) => MethodDecorator;
```

### Controller Decorator

### Feature Decorator
