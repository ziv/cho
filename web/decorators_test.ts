import {readMetadataObject} from "@chojs/core";
import {Controller, Delete, Get, Patch, Post, Put, Sse} from "./decorators.ts";
import {expect} from "@std/expect";

// sanity, class decorators

Deno.test("@Controller", () => {
  @Controller("test")
  class TestClass {}
  const meta = readMetadataObject(TestClass);
  expect(meta).toEqual({ deps: [], middlewares: [], route: "test" });
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
