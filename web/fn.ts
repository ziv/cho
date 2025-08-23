import type { Ctr, DescriptorFn } from "../core/di/types.ts";
import { FeatureDescriptor, WithRoute } from "./types.ts";

export function Route<D extends WithRoute>(
  route: string,
): DescriptorFn {
  return (d: D) => {
    if ("route" in d) {
      d.route = route;
    }
    return d;
  };
}

export function Controllers<D extends FeatureDescriptor>(
  ...controllers: Ctr[]
): DescriptorFn {
  return (d: D) => {
    if ("controllers" in d) {
      d.controllers.push(...controllers);
    }
    return d;
  };
}

export function Features<D extends FeatureDescriptor>(
  ...features: Ctr[]
): DescriptorFn {
  return (d: D) => {
    if ("features" in d) {
      d.features.push(...features);
    }
    return d;
  };
}
