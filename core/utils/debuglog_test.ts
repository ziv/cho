import { expect } from "@std/expect";
import { assertSpyCalls, spy } from "@std/testing/mock";
import { debuglog } from "./debuglog.ts";

Deno.test("debuglog should return a function", () => {
  expect(debuglog("test")).toBeInstanceOf(Function);
});

Deno.test("debuglog function should not log", () => {
  const logSpy = spy(console, "log");
  const errSpy = spy(console, "error");

  Deno.env.set("CHO_DEBUGLOG", "none");
  const log = debuglog("test");
  log("This is a test message");
  assertSpyCalls(logSpy, 0);
  assertSpyCalls(errSpy, 0);

  logSpy.restore();
  errSpy.restore();
});

Deno.test("debuglog function should log", () => {
  const logSpy = spy(console, "log");
  const errSpy = spy(console, "error");

  Deno.env.set("CHO_DEBUGLOG", "test");
  const log = debuglog("test");
  log("This is a test message");
  assertSpyCalls(logSpy, 1);
  assertSpyCalls(errSpy, 0);

  logSpy.restore();
  errSpy.restore();
});

Deno.test("debuglog function should not log errors", () => {
  const logSpy = spy(console, "log");
  const errSpy = spy(console, "error");

  Deno.env.set("CHO_DEBUGLOG", "none");
  const log = debuglog("test");
  log.error("This is a test message");
  assertSpyCalls(logSpy, 0);
  assertSpyCalls(errSpy, 0);

  logSpy.restore();
  errSpy.restore();
});

Deno.test("debuglog function should log error", () => {
  const logSpy = spy(console, "log");
  const errSpy = spy(console, "error");

  Deno.env.set("CHO_DEBUGLOG", "test");
  const log = debuglog("test");
  log.error("This is a test message");
  assertSpyCalls(logSpy, 0);
  assertSpyCalls(errSpy, 1);

  logSpy.restore();
  errSpy.restore();
});
