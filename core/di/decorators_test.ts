import { expect } from "@std/expect";
import { Injectable } from "./decorators.ts";
import { readMetadataObject } from "../meta/mod.ts";

Deno.test("injectable decorator should set metadata", () => {
  @Injectable({})
  class TestClass {}
  expect(readMetadataObject(TestClass)).toEqual({});
});

Deno.test("injectable decorator should set metadata", () => {
  @Injectable({ deps: ["dep1", "dep2"] })
  class TestClass {}
  expect(readMetadataObject(TestClass)).toEqual({ "deps": ["dep1", "dep2"] });
});
