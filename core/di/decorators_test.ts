import { expect } from "@std/expect";
import { Injectable, Module } from "./decorators.ts";
import { readMetadataObject } from "../meta/mod.ts";

// sanity check only
// the DI tests are under "core/di/specs" directory

Deno.test("injectable decorator should set metadata", () => {
  @Injectable({ deps: ["dep1", "dep2"] })
  class TestClass {}
  expect(readMetadataObject(TestClass)).toEqual({ deps: ["dep1", "dep2"] });
});

Deno.test("module decorator should set metadata", () => {
  @Module({ deps: ["dep1", "dep2"] })
  class TestClass {}
  expect(readMetadataObject(TestClass)).toEqual({ "deps": ["dep1", "dep2"] });
});
