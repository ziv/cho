import type { Target } from "@chojs/core/di";
import { read, write } from "@chojs/core/di";
import {
  ControllerDescriptor,
  FeatureDescriptor,
  MethodDescriptor,
} from "./types.ts";

const MethodMetadata = Symbol("MethodMetadata");
const ControllerMetadata = Symbol("ControllerMetadata");
const FeatureMetadata = Symbol("Feature");

export function setController(
  target: Target,
  data: Partial<ControllerDescriptor>,
) {
  write(target, ControllerMetadata, {
    route: data.route ?? "",
    middlewares: data.middlewares ?? [],
  });
}

export function setFeature(
  target: Target,
  data: Partial<FeatureDescriptor>,
) {
  write(target, FeatureMetadata, {
    route: data.route ?? "",
    middlewares: data.middlewares ?? [],
    controllers: data.controllers ?? [],
    features: data.features ?? [],
  });
}

export function setMethod(
  target: Target,
  data: Partial<MethodDescriptor>,
) {
  write(target, MethodMetadata, {
    name: data.name ?? "",
    route: data.route ?? "",
    method: data.method ?? "GET",
    middlewares: data.middlewares ?? [],
  });
}

export function getFeature(target: Target): FeatureDescriptor | undefined {
  return read<FeatureDescriptor>(target, FeatureMetadata);
}

export function getController(
  target: Target,
): ControllerDescriptor | undefined {
  return read<ControllerDescriptor>(target, ControllerMetadata);
}

export function getMethods(instance: object): MethodDescriptor[] {
  const props = Object.getOwnPropertyNames(
    Object.getPrototypeOf(instance),
  ) as (string & keyof typeof instance)[];

  const methods: MethodDescriptor[] = [];
  for (const name of props) {
    if (name === "constructor") {
      continue;
    }

    const func = instance[name];
    if (typeof func !== "function") {
      continue;
    }

    const metadata = read<MethodDescriptor>(func, MethodMetadata);
    if (!metadata) {
      continue;
    }

    methods.push(metadata);
  }
  return methods;
}
