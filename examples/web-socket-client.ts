import { hc } from "hono/client";
import app from "./web-socket.ts";

const client = hc<typeof app>("http://localhost:8000");
const ws = client.ws.$ws(0);
// console.log(ws);

ws.addEventListener("open", () => {
  setInterval(() => {
    ws.send(new Date().toString());
  }, 1000);
});

// console.log("done?");
