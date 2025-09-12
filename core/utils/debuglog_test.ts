import { expect } from "@std/expect";
import { assertSpyCalls, spy } from "@std/testing/mock";
import { debuglog } from "./debuglog.ts";

Deno.test("debuglog should return a function", () => {
  expect(debuglog("test")).toBeInstanceOf(Function);
});

Deno.test("debuglog functions should not log", () => {
  const errSpy = spy(console, "error");

  Deno.env.set("CHO_DEBUGLOG", "none");
  const log = debuglog("test");

  log("This is a test message");
  log.error("This is a test error message");
  log.start()("This is a test message with elapsed time");

  assertSpyCalls(errSpy, 0);
  errSpy.restore();
});

Deno.test("debuglog function should log", () => {
  const errSpy = spy(console, "error");

  Deno.env.set("CHO_DEBUGLOG", "test");
  const log = debuglog("test");

  log("This is a test message");
  log.error("This is a test error message");
  log.start()("This is a test message with elapsed time");

  assertSpyCalls(errSpy, 3);
  errSpy.restore();
});
