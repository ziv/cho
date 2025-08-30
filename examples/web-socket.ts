import { ChoWebApplication, Controller, Controllers, Feature, WebSocket } from "@chojs/web";
import { showRoutes } from "hono/dev";

@Controller()
class WsController {
  @WebSocket("ws")
  eee() {
    console.log("hello");
    return {
      onMessage(event: unknown, ws: WebSocket) {
        console.log("ws message", event);
        // ws.send("hello from server");
      },
    };
  }
}

@Feature(
  Controllers(WsController),
)
class AppFeature {
}

const app = await ChoWebApplication.create(AppFeature);

showRoutes(app.link.ref());

export default app;
