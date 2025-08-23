import type { Ctr, DescriptorFn } from "@cho/core/di";
import { FeatureDescriptor, WithRoute } from "./types.ts";

export function Route<D extends WithRoute>(
  route: string,
): DescriptorFn {
  return (d: Partial<D>) => {
    d.route = route;
    return d;
  };
}

export function Controllers<D extends FeatureDescriptor>(
  ...controllers: Ctr[]
): DescriptorFn {
  return (d: Partial<D>) => {
    if (d.controllers) {
      d.controllers.push(...controllers);
    } else {
      d.controllers = [...controllers];
    }
    return d;
  };
}

export function Features<D extends FeatureDescriptor>(
  ...features: Ctr[]
): DescriptorFn {
  return (d: D) => {
    if (d.features) {
      d.features.push(...features);
    } else {
      d.features = [...features];
    }
    return d;
  };
}
