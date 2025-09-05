import { expect } from "@std/expect";
import { readMetadataObject } from "@chojs/core";
import { Body, Controller, Get, Post, Query } from "./decorators.ts";

const validator = { safeParse: (data: unknown) => ({ success: true, data, error: null }) };

Deno.test("decorated controller", () => {
  @Controller("test-route")
  class TestController {
    @Get("test-get")
    testGet() {}

    @Post("test-post", [Body(), Query("key", validator)])
    testPost() {}
  }

  expect(readMetadataObject(TestController)).toEqual({ route: "test-route", deps: [] });
  expect(readMetadataObject(TestController.prototype.testGet)).toEqual({
    name: "testGet",
    route: "test-get",
    type: "GET",
    args: [],
  });
  // console.log(readMetadataObject(TestController.prototype.testPost));
});
