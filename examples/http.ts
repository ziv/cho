import { Controller, Controllers, Feature, Get, Route } from "@chojs/web";
import { Compiler } from "../web/compiler.ts";
import { OakLinker } from "../vendor/oak/oak-linker.ts";

@Controller(Route("aaa"))
class RootController {
  @Get("")
  index() {
    console.log("hello world!");
    return "Hello, World!";
  }

  @Get("foo")
  foo() {
    console.log("hello foo!");
    return "Hello, foo!";
  }
}

// @Controller(Route("api"))
// class DataController {
//   @Get("/data")
//   getData() {
//     console.log("data");
//     return { data: [1, 2, 3, 4, 5] };
//   }
// }

@Feature(
  Controllers(RootController),
)
class AppFeature {
}

const compiler = new Compiler();
const compiled = await compiler.compile(AppFeature);
const linker = new OakLinker();
console.log(compiled);
console.log(linker.link(compiled));
// Deno.serve(linker.handler())

await linker.ref().listen({ port: 8000 });
//
// const app = await ChoWebApplication.create(AppFeature);
//
// showRoutes(app.link.ref());
// Deno.serve(app.link.handler());
