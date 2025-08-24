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

export function Middlewares<D extends FeatureDescriptor>(
  ...middlewares: (Ctr | Token)[]
): DescriptorFn {
  return (d: Partial<D>) => {
    if (d.middlewares) {
      d.middlewares.push(...middlewares);
    } else {
      d.middlewares = [...middlewares];
    }
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
  return (d: Partial<D>) => {
    if (d.features) {
      d.features.push(...features);
    } else {
      d.features = [...features];
    }
    return d;
  };
}
