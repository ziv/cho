import { Controller, createApplication, Feature, Get } from "@chojs/web";
import { HonoLinker } from "@chojs/vendor";

@Controller("")
class RootController {
  @Get("")
  data() {
    console.log("/");
    return "A";
  }

  @Get("foo")
  foo() {
    console.log("/foo");
    return "B";
  }
}

@Controller("api")
class DataController {
  @Get("")
  data() {
    console.log("/api");
    return { data: [1, 2, 3, 4, 5] };
  }
  @Get("data")
  getData() {
    console.log("/api/data");
    return { data: [1, 2, 3, 4, 5] };
  }
}

@Feature({
  controllers: [RootController, DataController],
})
class AppFeature {
}

const app = await createApplication<Application>(AppFeature, { linker: new HonoLinker() });
Deno.serve(app.handler());
