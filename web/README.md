# Web

A thin wrapper around for web applications (HTTP Server).

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
