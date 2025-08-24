import { Controller, Get } from "../web/decorators.ts";
import { Context } from "hono";
import { Route } from "../web/fn.ts";

@Controller()
export class SomeController {
  @Get("")
  hello(c: Context) {
    return c.json({ status: "OK" });
  }

  @Get("version")
  version(c: Context) {
    return c.json({ version: "1.0.0" });
  }
}

@Controller(Route("api"))
export class AnotherController {
  @Get("another")
  another(c: Context) {
    return c.json({ another: true });
  }
}

@Controller(Route("api"))
export class YetAnotherController {
  @Get("foo")
  foo(c: Context) {
    return c.json({ test: true });
  }
}
