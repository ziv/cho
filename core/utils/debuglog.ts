/**
 * @category @chojs/core/utils
 */

import { env, envnum } from "./env.ts";
import { gray, magenta, red, yellow } from "@std/fmt/colors";
import { format } from "@std/datetime";
import { format as duration } from "@std/fmt/duration";

const CONTEXT_LEN = envnum("CHO_DEBUGLOG_CONTEXT_LEN") ?? 15;

let last = Date.now();

const timestamp = () => yellow(format(new Date(), "HH:MM:SS.mmm"));

const elapsed = () => {
  const now = Date.now();
  const diff = now - last;
  last = now;
  return gray(duration(diff, { ignoreZero: true }) || "+0ms");
};

const header = (context: string) => {
  if (context.length > CONTEXT_LEN) {
    context = context.substring(0, CONTEXT_LEN - 1) + "…";
  }
  const content = context.padEnd(CONTEXT_LEN, " ");
  return magenta(`[ ${content} ]`);
};

const errorHeader = (context: string) => {
  context = "Error:" + context;
  if (context.length > CONTEXT_LEN) {
    context = context.substring(0, CONTEXT_LEN - 1) + "…";
  }
  const content = context.padEnd(CONTEXT_LEN, " ");
  return red(`[ ${content} ]`);
};

/**
 * Debug log function factory.
 *
 * Returns a logging function that prefixes messages with a timestamp and context.
 * The logging function has an `error` method for error messages.
 *
 * The logging is enabled if the `CHO_DEBUGLOG` environment variable includes the context string.
 *
 * @example Usage:
 * ```ts
 * const log = debuglog("context");
 * log("This is a debug message");
 * log.error("This is an error message");
 * ```
 * Context length is limited to 15 characters by default, but can be adjusted
 * by setting the `CHO_DEBUGLOG_CONTEXT_LEN` environment variable.
 *
 * @example Output:
 * ```
 * 13:13:13.131 [ ExampleContext… ] example message +1ms
 * ```
 *
 * @private
 * @param context
 */
export function debuglog(
  context: string,
): { (...args: unknown[]): void; error(...args: unknown[]): void } {
  const canLog = () => {
    const debuglog: string = env("CHO_DEBUGLOG") ?? "";
    return debuglog.includes(context);
  };

  function log(...args: unknown[]) {
    if (canLog()) {
      console.log(
        timestamp(),
        header(context),
        ...args,
        elapsed(),
      );
    }
  }

  log.error = (...args: unknown[]) => {
    if (canLog()) {
      console.error(
        timestamp(),
        errorHeader(context),
        ...args,
        elapsed(),
      );
    }
  };

  return log;
}
