import { Controller, Feature, Get, Post } from "../web/decorators.ts";
import { Controllers, Route } from "../web/fn.ts";
import { Context } from "hono";
import ChoWebApplication from "../web/application.ts";
import { DependsOn, Provide } from "@cho/core/di";

@Controller()
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
  Controllers(MyController),
)
class MyFeature {
}

const app = await ChoWebApplication.create(MyFeature);
Deno.serve(app.linker.handler());
