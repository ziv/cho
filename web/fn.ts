import type { Any, Ctr, DescriptorFn, Target, Token } from "@chojs/core/di";
import { FeatureDescriptor, WithRoute } from "./builder.ts";
import { FeatureMeta } from "./meta.ts";

export function Route<D extends { route: string }>(
  route: string,
): DescriptorFn {
  return (d: Partial<D>) => {
    d.route = route;
    return d;
  };
}

export function Middlewares<D extends { middlewares: Target[] }>(
  ...middlewares: (Ctr | Token)[]
): DescriptorFn {
  return (d: Partial<D>) => {
    if (d.middlewares) {
      d.middlewares.push(...middlewares as Target[]);
    } else {
      d.middlewares = [...middlewares] as Target[];
    }
    return d;
  };
}

export function Controllers<D extends FeatureMeta>(
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

export function Features<D extends FeatureMeta>(
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
