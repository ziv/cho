import { expect } from "@std/expect";
import { isClass } from "./utils.ts";

Deno.test("isClass - should return true for class constructors", () => {
  class TestClass {}
  class AnotherClass {
    constructor() {}
  }
  class ClassWithMethods {
    static staticMethod() {}
  }

  expect(isClass(TestClass)).toBe(true);
  expect(isClass(AnotherClass)).toBe(true);
  expect(isClass(ClassWithMethods)).toBe(true);
});

Deno.test("isClass - should return false for regular functions", () => {
  function regularFunction() {}
  function functionWithArgs(a: number, b: string) {
    return a + b;
  }

  expect(isClass(regularFunction)).toBe(false);
  expect(isClass(functionWithArgs)).toBe(false);
});

Deno.test("isClass - should return undefined for async functions", () => {
  const asyncFunction = async () => {};
  const asyncArrowFunction = async (a: number) => a * 2;

  expect(isClass(asyncFunction)).toBe(undefined);
  expect(isClass(asyncArrowFunction)).toBe(undefined);
});

Deno.test("isClass - should return undefined for arrow functions", () => {
  const arrowFunction = () => {};
  const arrowFunctionWithArgs = (a: number, b: string) => a + b;

  expect(isClass(arrowFunction)).toBe(undefined);
  expect(isClass(arrowFunctionWithArgs)).toBe(undefined);
});

Deno.test("isClass - should return false for non-function values", () => {
  expect(isClass(null)).toBe(false);
  expect(isClass(undefined)).toBe(false);
  expect(isClass("string")).toBe(false);
  expect(isClass(123)).toBe(false);
  expect(isClass(true)).toBe(false);
  expect(isClass({})).toBe(false);
  expect(isClass([])).toBe(false);
  expect(isClass(Symbol("test"))).toBe(false);
});

Deno.test("isClass - should return true for built-in constructors", () => {
  expect(isClass(Object)).toBe(true);
  expect(isClass(Array)).toBe(true);
  expect(isClass(Date)).toBe(true);
  expect(isClass(Error)).toBe(true);
  expect(isClass(RegExp)).toBe(true);
});

Deno.test("isClass - should return false for function constructors", () => {
  const FunctionConstructor = function() {};
  FunctionConstructor.prototype = {};

  expect(isClass(FunctionConstructor)).toBe(false);
});

Deno.test("isClass - edge cases", () => {
  class EmptyClass {}

  const notAClass = function() {};
  notAClass.prototype = {};
  Object.defineProperty(notAClass, "prototype", { writable: false });

  expect(isClass(EmptyClass)).toBe(true);
  expect(isClass(notAClass)).toBe(true);
});