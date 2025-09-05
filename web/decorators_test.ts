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
});
// { route: "test-route", deps: [] }
// console.log();
// { name: "testGet", route: "test-get", type: "GET", args: []
// console.log(readMethod(TestController.prototype.testGet));
// {
//     name: "testPost",
//         route: "test-post",
//     type: "POST",
//     args: [
//     { type: "body" },
//     {
//         type: "query",
//         key: "key",
//         validator: { safeParse: [Function: safeParse] }
// }
// ]
// }
// console.log(readMethod(TestController.prototype.testPost));
