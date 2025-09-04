# RFC: Decorator Based Web Application Framework

[[toc]]

## Summary

This RFC proposes a decorator-based web application framework that allows developers to define controllers, endpoints,
and features using decorators. The framework will support dependency injection, routing, and middleware.

## Building Blocks

### Injectable Entity

An injectable entity is a class that can have dependencies injected into its constructor.
For more details, see the [Dependency Injection RFC](./di.md).

### Routable Entity

Any entity that can be routed to, such as an endpoint, a controller or a feature.
Routable entity can be associated with an optional route path and middlewares.

### Endpoint

An endpoint is a **routable** method within a controller that handles a specific HTTP request (e.g., GET, POST).

Endpoints are asynchronous methods, resolving a plain value, a response object, or throwing an error:

| Return Type     | Behavior                                                                                          |
|-----------------|---------------------------------------------------------------------------------------------------|
| Plain value     | Serialize to JSON and send as response body with 200 status code code unless otherwise specified. |
| Response object | Used as the response.                                                                             |
| Error thrown    | Propagate to the error handler.                                                                   |

### Controller

A controller is a **routable** class that exposes a set of routes (endpoints).
The controller is an **injectable** class that can have dependencies injected into its constructor.

### Feature

A feature is a **routable** module that exposes a set of controllers and/or sub-features.
The feature is an **injectable** class that can have dependencies injected into its constructor.

## Implementation Details

Decorators will be used to define controllers, endpoints, and features.
The decorators will be processed at runtime to set up the routing and middleware.

### Input Decorators

Since we are dealing with JS decorators, we cannot set decorators on method arguments directly.
Instead, we will use a special `@Args` decorator on the method itself to specify the arguments required by the method.

#### `@Args` Decorator

- If the `@Args` decorator is not present, the method will receive only the context object.
- The `@Args` decorator can specify multiple arguments, which will be passed to the method in the order they are
  defined.
- The context object is always exists and always the last argument of the method.

#### `@Args` Types

The `@Args` decorator types are a list of functions that extract specific parts of the request and validate them if a
validator is provided.

The validator should be an object with a `safeParse` method that takes the input and returns an object with the
following properties:

```ts
type Validator = {
    safeParse: (input: any) => {
        success: boolean,
        data?: any,
        error?: any
    }
};
```

Libraries support this interface include Zod, Yup, Joi, Valibot, and many others.

The following types should be supported:

| Type                      | Description                                                     |
|---------------------------|-----------------------------------------------------------------|
| `Param(name, validator?)` | Extracts a path parameter from the request URL                  |
| `Param(validator?)`       | Extracts all path parameters from the request URL as an object  |
| `Query(name, validator?)` | Extracts a query parameter from the request URL                 |
| `Query(validator?)`       | Extracts all query parameters from the request URL as an object |
| `Body(name, validator?)`  | Extracts path from request body                                 |
| `Body(validator?)`        | Extracts all body from the request                              |
| `Header(name)`            | Extracts a header from the request                              |
| `Cookie(name)`            | Extracts a cookie from the request                              |

Example:

```ts

class MyController {

    @Args(Body(validator), Header('x-api-key'), Cookie('session_id'))
    @Post()
    save(
        body: typeof validator,
        key: string,
        sessionsId: string,
        ctx: ChoContext // the context is always the last argument
    ) {
        // do something with body, key, sessionsId, ctx
    }
}
```

### Middlewares Decorator

### Method Decorators

### Controller Decorator

### Examples

```ts
const qsValidator = {};
const bodyValidator = {};

@Middlewares(/* list of middlewares */)
@Controller("prefix")
class MyController {

    @Middlewares(/* list of middlewares */)
    @Args(Param("name"), Query(qsValidator))
    @Get('hello/:name')
    hello(name: string, ctx: ChoContext) {
        return {message: 'Hello ' + name};
    }

    @Middlewares(/* list of middlewares */)
    @Args(Body(bodyValidator))
    @Post('data')
    postData(data: typeof bodyValidator, ctx: ChoContext) {
    }
}
```

### Feature Decorator
