import { gray, magenta, yellow } from "./colors.ts";
import { time } from "./utils.ts";

const CONTEXT_LEN = Number(Deno.env.get("CHO_DEBUGLOG_CONTEXT_LEN") ?? "15");
// const CHO_DEBUG = Boolean(Deno.env.get("CHO_DEBUG") ?? "true");

let past = Date.now();

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
