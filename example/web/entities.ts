import { Context } from "hono";
import { Controller, Controllers, Feature, Get } from "@chojs/web";

@Controller()
export class ExampleController {
  // example end point with path parameter
  @Get("hello/:name")
  hello(ctx: Context) {
    const name = ctx.req.param("name");
    return ctx.text(`Hello, ${name}`);
  }
}

@Feature(
  Controllers(ExampleController),
)
export class ExampleFeature {
}
