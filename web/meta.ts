import { Ctr, read, Target, write } from "@chojs/core";
import { MethodDescriptor } from "./types.ts";

export const MiddlewareMeta = Symbol("cho:middleware");
export const MethodMeta = Symbol("cho:method");

export function readMethod(target: Target): MethodDescriptor | undefined {
  return read<MethodDescriptor>(target, MethodMeta);
}

export function writeMethod(target: Target, md: MethodDescriptor): void {
  write(target, MethodMeta, md);
}

export function readMiddlewares(target: Target): (Ctr | Target)[] {
  return read<(Ctr | Target)[]>(target, MiddlewareMeta) ?? [];
}

export function writeMiddlewares(target: Target, mws: (Ctr | Target)[]): void {
  write(target, MiddlewareMeta, mws);
}
