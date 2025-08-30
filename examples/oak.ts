import { Application } from "@oak/oak";
import { Router } from "@oak/oak/router";

const app = new Application();
const router = new Router();

router.get("/", (c) => {
  c.response.body = "Hello, World!";
});
router.get("/foo", (c) => {
  c.response.body = "Hello, Foo!";
});

app.use(router.routes());

app.listen({ port: 8000 });
