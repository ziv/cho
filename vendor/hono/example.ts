import { showRoutes } from "hono/dev";
import { compile, Context, Controller, Feature, Get, linker, Params, Post } from "@chojs/web";
import { describeRoutes } from "@chojs/dev";
import { HonoAdapter } from "./hono-adapter.ts";

@Controller("")
class ExampleController {
  @Get("")
  example() {
    return { message: "Hello, World!" };
  }

  @Post("test")
  test(ctx: Context) {
    return ctx.text("text");
  }

  @Get(":id", [
    Params("id"),
  ])
  exampleId(id: string) {
    return { message: `Hello, your id is ${id}` };
  }
}

@Feature({
  controllers: [ExampleController],
})
class ExampleFeature {
}

const compiled = await compile(ExampleFeature);
// console.log(compiled);
const linked = linker(compiled, new HonoAdapter());
showRoutes(linked);
describeRoutes(ExampleFeature);
// console.log(linked);

// Deno.serve(linked.fetch);
