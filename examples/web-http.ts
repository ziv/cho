#!/usr/bin/env deno run --allow-all
import { HonoAdapter } from "@chojs/vendor-hono";
import { describeRoutes } from "@chojs/dev";
import { Controller, Dependencies, Injectable, Module } from "@chojs/core";
import { Application, Args, ChoWebContext, Get, Params } from "@chojs/web";

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
  args(key: string, c: ChoWebContext) {
    // console.log(key);
    return { key, url: this.service.url };
  }
}

@Module({
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

const app = await Application.create(AppFeature, new HonoAdapter());

// describeRoutes(app.instance);
// Deno.serve(app.appRef.fetch);
