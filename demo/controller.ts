import {
  Controller,
  Feature,
  Get,
  Middlewares,
  Post,
} from "../web/decorators.ts";
import { controllers, route } from "../web/fn.ts";
import { Context } from "hono";
import ChoWebApplication from "../web/application.ts";
import { DependsOn, Injectable, Provide } from "@cho/core/di";

@Injectable()
class ClassMiddleware {
  constructor(private foo: string) {
  }
  handle(c: Context, next: () => Promise<void>) {
    console.log("ClassMiddleware", this.foo);
    return next();
  }
}

function funcMiddlewareasync(c: Context, next: () => Promise<void>) {
  next().catch(console.error);
}

@Middlewares(ClassMiddleware, funcMiddlewareasync)
@Controller(
  route("foo"),
  DependsOn("foo"),
)
class MyController {
  constructor(private foo: string) {
  }

  @Middlewares(ClassMiddleware, funcMiddlewareasync)
  @Get("bar")
  myMethod(c: Context) {
    return c.json({
      foo: "1",
    });
  }

  @Post("foo")
  myPostMethod(c: Context) {
    return c.json({
      foo: "post",
    });
  }
}

@Middlewares(ClassMiddleware, funcMiddlewareasync)
@Feature(
  controllers(MyController),
  Provide("foo", () => "bar"),
  Provide(ClassMiddleware),
)
class MyFeature {
}

const app = await ChoWebApplication.create(MyFeature);
Deno.serve(app.linker.handler());
