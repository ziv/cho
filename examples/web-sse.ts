#!/usr/bin/env deno run --allow-all
import { Args, Compiler, Controller, Feature, Get, Linker, Params, Query, Sse, SseAsync } from "@chojs/web";
import { HonoAdapter } from "@chojs/vendor-hono";
import { describeRoutes } from "@chojs/dev";
import { SSEStreamingApi } from "@chojs/web/interfaces";

@Controller()
class SSEController {
  @Get("version")
  version() {
    return { version: "1.0.0" };
  }

  @Args(Query("name"))
  @Sse("sse")
  async example(name: string, stream: SSEStreamingApi) {
    for (let id = 0; id < 10; id++) {
      const message = `It is ${new Date().toISOString()}, ${name}`;
      stream.writeSSE({
        data: message,
        event: "time-update",
        id: String(id),
      });
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  @Args(Params("id"))
  @SseAsync("sse-async/:id")
  async *asyncExample(param: string) {
    for (let id = 0; id < 10; id++) {
      const message = `It is ${new Date().toISOString()}, ${param}`;
      yield {
        data: message,
        event: "time-update",
        id: String(id),
      };
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
}

@Feature({
  controllers: [SSEController],
})
class AppFeature {
}

const compiled = await new Compiler().compile(AppFeature);
const linked = new Linker(new HonoAdapter()).link(compiled);

describeRoutes(compiled);
Deno.serve(linked.fetch);
