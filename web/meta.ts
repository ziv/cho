import {
  createDescriptorCreator,
  createGetMetadata,
  createSetMetadata,
} from "../core/di/meta.ts";
import type { Ctr, Provider, Token } from "../core/di/types.ts";
import { read } from "../core/di/utils.ts";
import {
  ControllerDescriptor,
  FeatureDescriptor,
  MethodDescriptor,
  MiddlewareDescriptor,
} from "./types.ts";

const MiddlewareMetadata = Symbol("MiddlewareMetadata");
const MethodMetadata = Symbol("MethodMetadata");
const ControllerMetadata = Symbol("ControllerMetadata");
const FeatureMetadata = Symbol("Feature");

export const CreateMethod = createDescriptorCreator<MethodDescriptor>({
  name: "",
  route: "",
  method: "GET", // default method
  middlewares: [],
});

export const CreateController = createDescriptorCreator<ControllerDescriptor>({
  route: "",
  dependencies: [] as Token[],
  middlewares: [] as MiddlewareDescriptor[],
});

export const CreateFeature = createDescriptorCreator<FeatureDescriptor>({
  route: "",
  // imports: [] as any[],
  middlewares: [] as MiddlewareDescriptor[],
  // providers: [] as Provider[],
  controllers: [] as Ctr[],
  features: [] as Ctr[],
  dependencies: [] as Token[],
});

export const GetMethod = createGetMetadata<MethodDescriptor>(MethodMetadata);

export const GetController = createGetMetadata<ControllerDescriptor>(
  ControllerMetadata,
);

export const GetMiddleware = createGetMetadata<MiddlewareDescriptor>(
  MiddlewareMetadata,
);

export const GetFeature = createGetMetadata<FeatureDescriptor>(FeatureMetadata);

export const SetMiddleware = createSetMetadata<MiddlewareDescriptor>(
  MiddlewareMetadata,
  ["middlewares"],
);

export const SetMethod = createSetMetadata<MethodDescriptor>(
  MethodMetadata,
  ["route", "method", "name"],
);

export const SetController = createSetMetadata<ControllerDescriptor>(
  ControllerMetadata,
  ["route"],
);

export const SetFeature = createSetMetadata<FeatureDescriptor>(
  FeatureMetadata,
  ["route", "features", "controllers"],
);

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
