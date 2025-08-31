# @chojs/web

A thin wrapper for web applications (HTTP Server).

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
    return { hello: "world" };
  }

  @Get(
    Route("data"),
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

## Internals

- Phase 1: Define Controllers and Features (decorators)
- Phase 2: Create abstract feature tree (builder)
- Phase 3: Create concrete representation with instances (builder-ref)
- Phase 4: Linking (linker)
- Phase 5: Ready to serve

## Structuring TBD

```ts
import { Middleware, Route } from "./fn";
import { Post } from "./decorators";
import { validator } from "./validator";

@Controller(
  // apply prefix on all routes in this controller
  Route("prefix"),
  // apply middlewares on all routes in this controller
  Middlewares(a, b, c),
)
class SomeController {
  @Post(
    "route",
    // apply middlewares on this route
    Middlewares(d, e, f),
    // configure the arguments (wich and how to extract)
    Args(
      Body(validator),
      Body("name", validator),
      Query(validator),
      Query("name", validator),
      Params(validator),
      Param("name", validator),
    ),
  )
  save(body, query, params, ctx) {
    // ...
  }
}
```
