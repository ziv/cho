import { indexed, yellow } from "./colors.ts";

const CONTEXT_LENGTH = 13;

export function hash(text: string, mod = 10) {
    return text.split("").reduce((acc, cur) => acc + cur.charCodeAt(0), 0);
}

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
            yellow(`${h}:${m}:${s}.${ms}`),
            indexed(`[ ${header} ]`, hash(context)),
            ...args,
        );
    };
}
