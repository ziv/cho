import { Controller, Feature, Get, Post } from "../web/decorators.ts";
import { controllers, route } from "../web/fn.ts";
import { Context } from "hono";
import ChoWebApplication from "../web/application.ts";

@Controller(route("foo"))
class MyController {
  @Get("bar")
  myMethod(c: Context) {
    return c.json({
      foo: "1",
    });
  }

  @Post("foo")
  myPostMethod(c: Context) {
    return c.json({
      foo: "post",
    });
  }
}

@Feature(
  controllers(MyController),
)
class MyFeature {
}

const app = await ChoWebApplication.create(MyFeature);
Deno.serve(app.linker.handler());
