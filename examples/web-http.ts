#!/usr/bin/env deno run --allow-all
import {Args, Compiler, Controller, Feature, Get, Linker, Params} from "@chojs/web";
import {HonoAdapter} from "@chojs/vendor-hono";
import {describeRoutes} from "@chojs/dev";
import {Dependencies, Injectable} from "@chojs/core";

@Injectable()
@Dependencies("API_URL")
class Service {
  constructor(readonly url: string) {
  }
}

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
@Dependencies(Service)
class DataController {
  constructor(readonly service: Service) {
  }

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

  @Args(Params("key"))
  @Get("data/:key")
  args(key: string) {
    return { key, url: this.service.url };
  }
}

@Feature({
  providers: [
    {
      provide: "API_URL",
      factory: () => Promise.resolve("https://api.example.com"),
    },
    Service,
  ],
  controllers: [RootController, DataController],
})
class AppFeature {
}

const compiled = await new Compiler().compile(AppFeature);
const linked = new Linker(new HonoAdapter()).link(compiled);

describeRoutes(compiled);
Deno.serve(linked.fetch);
