import { showRoutes } from "hono/dev";
import { compile, Controller, Feature, Get, linker, Params } from "@chojs/web";
import { HonoAdapter } from "./hono-adapter.ts";

@Controller("")
class ExampleController {
  @Get("")
  example() {
    return { message: "Hello, World!" };
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
// console.log(linked);

Deno.serve(linked.fetch);
