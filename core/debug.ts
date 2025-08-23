import { color, colorIndex, hash } from "./utils.ts";

const CONTEXT_LENGTH = 13;

export default function debuglog(context: string) {
  if (context.length > CONTEXT_LENGTH) {
    context = context.substring(0, CONTEXT_LENGTH) + "…";
  }
  const header = context.padEnd(CONTEXT_LENGTH + 3, " ");

  const d = new Date();
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  const s = d.getSeconds().toString().padStart(2, "0");
  const ms = d.getMilliseconds().toString().padStart(3, "0");

  return (...args: unknown[]) => {
    console.log(
      color(`${h}:${m}:${s}.${ms}`, "Yellow"),
      colorIndex(`[ ${header} ]`, hash(context)),
      ...args,
    );
  };
}
