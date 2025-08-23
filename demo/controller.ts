import { Controller, Feature, Get, Post } from "../web/decorators.ts";
import { controllers, route } from "../web/fn.ts";
import { Context } from "hono";
import ChoWebApplication from "../web/application.ts";
import { dependsOn, provide } from "@cho/core/di";

@Controller(
  route("foo"),
  dependsOn("foo"),
)
class MyController {
  constructor(private foo: string) {
  }
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
  provide("foo", () => "bar"),
)
class MyFeature {
}

const app = await ChoWebApplication.create(MyFeature);
Deno.serve(app.linker.handler());
