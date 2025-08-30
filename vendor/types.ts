import { Any } from "@chojs/core";
import { ChoContext } from "./context.ts";

export type Next = () => void | Promise<void>;

export type Middleware<T = Any> = (ctx: ChoContext<T>, next: Next) => void | Promise<void>;
