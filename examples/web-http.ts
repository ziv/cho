#!/usr/bin/env deno run --allow-all
import { Compiler, Controller, Feature, Get, Linker } from "@chojs/web";
import { HonoAdapter } from "@chojs/vendor-hono";
import { describeRoutes } from "@chojs/dev";

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

const compiled = await new Compiler().compile(AppFeature);
const linked = new Linker(new HonoAdapter()).link(compiled);

describeRoutes(compiled);
Deno.serve(linked.fetch);
