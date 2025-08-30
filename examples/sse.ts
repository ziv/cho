import { ChoWebApplication, Controller, Controllers, Feature, Get, Sse } from "@chojs/web";
import { showRoutes } from "hono/dev";
import { Context } from "npm:hono@4.9.2";

@Controller()
class SSEController {
  @Get("version")
  version() {
    return { version: "1.0.0" };
  }

  @Sse("sse")
  async example(c: Context, stream: WritableStreamDefaultWriter) {
    let id = 0;
    while (true) {
      const message = `It is ${new Date().toISOString()}`;
      await stream.writeSSE({
        data: message,
        event: "time-update",
        id: String(id++),
      });
      console.log(message);
      await stream.sleep(1000);
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
