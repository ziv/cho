import { gray, magenta, red, yellow } from "@std/fmt/colors";
import { format } from "@std/datetime";
import { format as duration } from "@std/fmt/duration";
import { env, envbool, envnum } from "./env.ts";

const TIMESTAMP = env("CHO_DEBUGLOG_TIMESTAMP") ?? "HH:mm:ss.SSS";
const CONTEXT_LEN = isNaN(envnum("CHO_DEBUGLOG_CONTEXT_LEN"))
  ? 15
  : envnum("CHO_DEBUGLOG_CONTEXT_LEN");

let last = Date.now();

/**
 * Debug log function factory.
 *
 * Returns a logging function that prefixes messages with a timestamp and context.
 * The logging function has an `error` method for error messages.
 *
 * The logging configured using the following environment variables:
 * - `CHO_DEBUG`: Enable all debug logging if set to a truthy value.
 * - `CHO_DEBUGLOG`: Comma-separated list of contexts to enable logging for, or `*` for all contexts.
 * - `CHO_DEBUGLOG_TIMESTAMP`: Timestamp format (default: `HH:MM:SS.mmm`).
 * - `CHO_DEBUGLOG_CONTEXT_LEN`: Maximum length of the context string (default: `15`).
 *
 * @example Usage:
 * ```ts
 * const log = debuglog("context");
 * log("This is a debug message");
 * log.error("This is an error message");
 * ```
 *
 * @example Output:
 * ```
 * 13:13:13.131 [ ExampleContext… ] example message +1ms
 * ```
 *
 * @private
 * @param context
 * @returns logging function
 * @category @chojs/core/utils
 */
export function debuglog(
  context: string,
): { (...args: unknown[]): void; error(...args: unknown[]): void } {
  const canLog = () => {
    // system-wide debug logging
    if (envbool("CHO_DEBUG")) {
      return true;
    }
    // context-specific debug logging
    const debuglog: string = env("CHO_DEBUGLOG") ?? "";
    return debuglog.includes(context) || debuglog.includes("*");
  };

  const elapsed = () => {
    const now = Date.now();
    const diff = now - last;
    last = now;
    return diff;
  };

  const header = () =>
    (context.length > CONTEXT_LEN)
      ? context.substring(0, CONTEXT_LEN - 1) + "…"
      : context.padEnd(CONTEXT_LEN, " ");

  function log(...args: unknown[]) {
    if (canLog()) {
      console.log(
        yellow(format(new Date(), TIMESTAMP)),
        magenta(`[ ${header()} ]`),
        ...args,
        gray(duration(elapsed(), { ignoreZero: true }) || "+0ms"),
      );
    }
  }

  log.error = (...args: unknown[]) => {
    if (canLog()) {
      console.error(
        yellow(format(new Date(), TIMESTAMP)),
        red(`[ ${header()} ]`),
        ...args,
        gray(duration(elapsed(), { ignoreZero: true }) || "+0ms"),
      );
    }
  };

  return log;
}
