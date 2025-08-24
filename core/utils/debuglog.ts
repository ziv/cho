import {gray, magenta, yellow} from "./colors.ts";
import {time} from "./date-time.ts";
import {env} from "./env.ts";

const CONTEXT_LEN = Number(env("CHO_DEBUGLOG_CONTEXT_LEN") ?? "15");
// const CHO_DEBUG = Boolean(Deno.env.get("CHO_DEBUG") ?? "true");

let past = Date.now();

/**
 * Debug log function factory.
 *
 * @example Usage:
 * ```ts
 * const log = debuglog("MyContext");
 * log("This is a debug message");
 * ```
 * Context length is limited to 15 characters by default, but can be adjusted
 * by setting the `CHO_DEBUGLOG_CONTEXT_LEN` environment variable.
 *
 * @example Output:
 * ```
 * 13:32:59.248 [ SomeFeatureBui… ] message +1ms
 * ```
 *
 * @private
 * @param context
 */
export function debuglog(context: string) {
  if (context.length > CONTEXT_LEN) {
    context = context.substring(0, CONTEXT_LEN - 1) + "…";
  }
  const header = context.padEnd(CONTEXT_LEN, " ");
  function log(...args: unknown[]) {
    const now = Date.now();
    const diff = now - past;
    past = now;
    console.log(
      yellow(time()),
      magenta(`[ ${header} ]`),
      ...args,
      gray(`+${diff}ms`),
    );
  }

  return log;
}
