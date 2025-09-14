import { readMetadataObject } from "@chojs/core";
import { Catch, Controller, Delete, Feature, Get, Middlewares, Patch, Post, Put, Sse } from "./decorators.ts";
import { expect } from "@std/expect";
import { Context, ErrorHandler } from "./interfaces/mod.ts";

// sanity, class decorators

Deno.test("@Controller", () => {
  @Controller("test")
  class TestClass {}
  const meta = readMetadataObject(TestClass);
  expect(meta).toEqual({
    route: "test",
    deps: [],
    middlewares: [],
  });
});

Deno.test("@Feature", () => {
  @Feature()
  class TestClass {}
  const meta = readMetadataObject(TestClass);
  expect(meta).toEqual({
    route: "",
    deps: [],
    middlewares: [],
    controllers: [],
    features: [],
    imports: [],
    providers: [],
  });
});

Deno.test("@Middlewares", () => {
  @Middlewares()
  class TestClass {}
  const meta = readMetadataObject(TestClass);
  expect(meta).toEqual({
    middlewares: [],
  });
});

Deno.test("@Catch", () => {
  class Handler implements ErrorHandler {
    catch(err: unknown, ctx: Context): Promise<Response> {
      return Promise.resolve(new Response());
    }
  }

  @Catch(Handler)
  class TestClass {}
  const meta = readMetadataObject(TestClass);
  expect(meta).toEqual({
    errorHandler: Handler,
  });
});

// sanity, method decorators

Deno.test("@Get", () => {
  class TestClass {
    @Get("test")
    test() {}
  }
  const meta = readMetadataObject(TestClass.prototype.test);
  expect(meta).toEqual({ name: "test", route: "test", type: "GET", args: [] });
});

Deno.test("@Post", () => {
  class TestClass {
    @Post("test")
    test() {}
  }
  const meta = readMetadataObject(TestClass.prototype.test);
  expect(meta).toEqual({ name: "test", route: "test", type: "POST", args: [] });
});

Deno.test("@Put", () => {
  class TestClass {
    @Put("test")
    test() {}
  }
  const meta = readMetadataObject(TestClass.prototype.test);
  expect(meta).toEqual({ name: "test", route: "test", type: "PUT", args: [] });
});

Deno.test("@Patch", () => {
  class TestClass {
    @Patch("test")
    test() {}
  }
  const meta = readMetadataObject(TestClass.prototype.test);
  expect(meta).toEqual({ name: "test", route: "test", type: "PATCH", args: [] });
});

Deno.test("@Delete", () => {
  class TestClass {
    @Delete("test")
    test() {}
  }
  const meta = readMetadataObject(TestClass.prototype.test);
  expect(meta).toEqual({ name: "test", route: "test", type: "DELETE", args: [] });
});

Deno.test("@Sse", () => {
  class TestClass {
    @Sse("test")
    test() {}
  }
  const meta = readMetadataObject(TestClass.prototype.test);
  expect(meta).toEqual({ name: "test", route: "test", type: "SSE", args: [] });
});
