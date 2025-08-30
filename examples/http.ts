import { Controller, Controllers, createApplication, Feature, Get, Route } from "@chojs/web";
import { OakLinker } from "@chojs/vendor/oak";
import { Application } from "@oak/oak";

@Controller(Route(""))
class RootController {
  @Get("")
  data() {
    console.log("A");
    return "A";
  }

  @Get("foo")
  foo() {
    console.log("B");
    return "B";
  }
}

@Controller(Route("api"))
class DataController {
  @Get("")
  data() {
    console.log("D");
    return { data: [1, 2, 3, 4, 5] };
  }
  @Get("data")
  getData() {
    console.log("data");
    return { data: [1, 2, 3, 4, 5] };
  }
}

@Feature(
  Controllers(RootController, DataController),
)
class AppFeature {
}

const app = await createApplication<Application>(AppFeature, { linker: new OakLinker() });
Deno.serve(app.handler());
