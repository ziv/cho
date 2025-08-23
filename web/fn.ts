import type { Ctr, DescriptorFn } from "../core/di/types.ts";
import { FeatureDescriptor, WithRoute } from "./types.ts";

export function route<D extends WithRoute>(
  route: string,
): DescriptorFn {
  return (d: D) => {
    if ("route" in d) {
      d.route = route;
    }
    return d;
  };
}

export function controllers<D extends FeatureDescriptor>(
  ...controllers: Ctr[]
): DescriptorFn {
  return (d: D) => {
    if ("controllers" in d) {
      d.controllers.push(...controllers);
    }
    return d;
  };
}
