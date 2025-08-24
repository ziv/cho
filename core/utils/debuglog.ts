import { envbool, envnum } from "./env.ts";
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

const error = (context: string) => {
  context = "Error:" + context;
  if (context.length > CONTEXT_LEN) {
    context = context.substring(0, CONTEXT_LEN - 1) + "…";
  }
  const content = context.padEnd(CONTEXT_LEN, " ");
  return red(`[ ${content} ]`);
};

/**
 * Debug log function factory.
 * Returns a logging function that prefixes messages with a timestamp and context.
 * The logging function has an `error` method for error messages.
 *
 * @example Usage:
 * ```ts
 * const log = debuglog("MyContext");
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
export function debuglog(context: string) {
  function log(...args: unknown[]) {
    if (envbool("CHO_DEBUGLOG")) {
      console.log(
        timestamp(),
        header(context),
        ...args,
        elapsed(),
      );
    }
  }

  log.error = (...args: unknown[]) => {
    if (envbool("CHO_DEBUGLOG")) {
      console.error(
        timestamp(),
        error(context),
        ...args,
        elapsed(),
      );
    }
  };

  return log;
}
