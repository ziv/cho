import { expect } from "@std/expect";
import { assertSpyCalls, spy, stub } from "@std/testing/mock";
import { debuglog } from "./debuglog.ts";

Deno.test("debuglog should return a function", () => {
  expect(debuglog("test")).toBeInstanceOf(Function);
});

Deno.test("debuglog function should not log", () => {
  const logSpy = spy(console, "log");
  const log = debuglog("test");
  log("This is a test message");
  assertSpyCalls(logSpy, 0);
  logSpy.restore();
});

Deno.test("debuglog function should log", () => {
  const envStub = stub(Deno.env, "get", () => "true");
  const logSpy = spy(console, "log");

  const log = debuglog("test");
  log("This is a test message");
  assertSpyCalls(logSpy, 1);
  envStub.restore();
  logSpy.restore();
});

Deno.test("debuglog function should not log errors", () => {
  const logSpy = spy(console, "error");
  const log = debuglog("test");
  log.error("This is a test message");
  assertSpyCalls(logSpy, 0);
  logSpy.restore();
});

Deno.test("debuglog function should log error", () => {
  const envStub = stub(Deno.env, "get", () => "true");
  const logSpy = spy(console, "error");

  const log = debuglog("test");
  log.error("This is a test message");
  assertSpyCalls(logSpy, 1);
  envStub.restore();
  logSpy.restore();
});
