import { Context } from "./context.ts";

export interface ChoGuard {
  canActivate(ctx: Context): Promise<boolean>;
}
