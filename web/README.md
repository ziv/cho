# Web

A thin wrapper around for web applications (HTTP Server).

## Building Blocks

### HTTP Methods

HTTP methods are defined using decorators such as `@Get`, `@Post`, `@Put`, `@Delete`, etc. Each method corresponds to an
endpoint within a controller.

### Controller

A controller represents a group of related endpoints. It is defined using the `@Controller` decorator.

Controller can have route prefix, which will be applied to all endpoints within the controller.

Example:

```ts

@Controller(Route("api"))
export class MyController {
    @Get("hello")
    hello(ctx: ChoContext) {
        return ctx.json({message: "Hello, World!"});
    }

    @Get(
        Route("data")
    )
    getData(ctx: ChoContext) {
    }
    
    @Post("data")
    saceData(ctx: ChoContext) {
    }
}
```

### Feature

A feature is a module that holds controllers and/or another features.

Feature can have route prefix, which will be applied to all endpoints within the feature.


Example:

```ts
function foo(req, res, next) {
}

class Bar implements ChoMiddleware {
    handle(req, res, next) {
        // Do something
        next();
    }
}

@Middlewares(foo, Bar)
@Controller("api")
class MyController {
    @Get("")
    example(ctx: ChoContext) {
        return "Hello, World!";
    }

    @Middlewares(foo)
    @Post("")
    examplePost(ctx: ChoContext) {
        return `Received: ${JSON.stringify(body)}`;
    }
}
```
