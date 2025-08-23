import { Any } from "../core/di/types.ts";
import { FeatureDescriptor } from "./fn.ts";
import Injector from "../core/di/injector.ts";

export type EndPointDescriptor = {
  name: string;
  route: string;
  method: string;
};

export type ProcessedController = {
  route: string;
  controller: Any;
  endpoints: EndPointDescriptor[];
};

export type ProcessedFeature = {
  route: string;
  injector: Injector;
  features: ProcessedFeature[];
  controllers: ProcessedController[];
};
