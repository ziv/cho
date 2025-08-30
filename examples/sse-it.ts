import { ChoWebApplication, Controller, Controllers, Feature, Get, Sse, Sseit } from "@chojs/web";
import { showRoutes } from "hono/dev";
import { Context } from "npm:hono@4.9.2";

@Controller()
class SSEController {
  @Get("version")
  version() {
    return { version: "1.0.0" };
  }

  @Sseit("sseit")
  async *example(c: Context) {
    console.log("SSEIT");
    let id = 0;
    while (true) {
      const message = `It is ${new Date().toISOString()}`;
      yield {
        data: message,
        event: "time-update",
        id: String(id++),
      };
      // console.log(message);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

@Feature(
  Controllers(SSEController),
)
class AppFeature {
}

const app = await ChoWebApplication.create(AppFeature);

showRoutes(app.link.ref());
Deno.serve(app.link.handler());
