import app from "./web-socket.ts";

Deno.serve(app.link.handler());
