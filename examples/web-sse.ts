#!/usr/bin/env -S deno run --allow-all
import { compile, Context, Controller, Feature, Get, linker, Sse } from "@chojs/web";
import { HonoAdapter } from "@chojs/vendor-hono";
import { describeRoutes } from "@chojs/dev";

@Controller()
class SSEController {
  @Get("version")
  version() {
    return { version: "1.0.0" };
  }

  @Sse("sse")
  async *example(c: Context) {
    for (let id = 0; id < 10; id++) {
      const message = `It is ${new Date().toISOString()}`;
      yield {
        data: message,
        event: "time-update",
        id: String(id),
      };
      console.log(message);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
}

@Feature({
  controllers: [SSEController],
})
class AppFeature {
}

const compiled = await compile(AppFeature);
const linked = linker(compiled, new HonoAdapter());

describeRoutes(AppFeature);
Deno.serve(linked.fetch);
