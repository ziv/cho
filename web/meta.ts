import type { Ctr, Target } from "@chojs/core/di";
import { read, write } from "@chojs/core/di";
import {
  ControllerDescriptor,
  FeatureDescriptor,
  MethodDescriptor,
} from "./types.ts";

const MethodMetadata = Symbol("MethodMetadata");
const ControllerMetadata = Symbol("ControllerMetadata");
const FeatureMetadata = Symbol("Feature");

export type ControllerMeta = {
  route: string;
  middlewares: Target[];
};

export function setController(
  target: Target,
  data: Partial<ControllerMeta>,
) {
  write(target, ControllerMetadata, {
    route: data.route ?? "",
    middlewares: data.middlewares ?? [],
  });
}

export type FeatureMeta = {
  route: string;
  middlewares: Target[];
  controllers: Ctr[];
  features: Ctr[];
};

export function setFeature(
  target: Target,
  data: Partial<FeatureMeta>,
) {
  write(target, FeatureMetadata, {
    route: data.route ?? "",
    middlewares: data.middlewares ?? [],
    controllers: data.controllers ?? [],
    features: data.features ?? [],
  });
}

export type MethodMeta = {
  name: string;
  route: string;
  method: string;
  middlewares: Target[];
};

export function setMethod(
  target: Target,
  data: Partial<MethodMeta>,
) {
  write(target, MethodMetadata, {
    name: data.name ?? "",
    route: data.route ?? "",
    method: data.method ?? "GET",
    middlewares: data.middlewares ?? [],
  });
}

export function getFeature(target: Target): FeatureMeta | undefined {
  return read<FeatureMeta>(target, FeatureMetadata);
}

export function getController(
  target: Target,
): ControllerMeta | undefined {
  return read<ControllerMeta>(target, ControllerMetadata);
}

export function getMethod(
  target: Target,
): MethodMeta | undefined {
  return read<MethodMeta>(target, MethodMetadata);
}

export function getMethods(ctr: Ctr): MethodMeta[] {
  const props = Object.getOwnPropertyNames(
    ctr.prototype,
  ) as (string & keyof typeof instance)[];

  return props
    .filter((name) => name !== "constructor")
    .filter((name) => typeof ctr.prototype[name] === "function")
    .map((name) => getMethod(ctr.prototype[name]))
    .filter(Boolean);
}
