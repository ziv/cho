import type {
  Ctr,
  DescriptorFn,
  InjectableDescriptor,
  ModuleDescriptor,
  Target,
  Token,
} from "../core/di/types.ts";

export type MethodContext = {
  kind: string;
  name: string;
  static: boolean;
  private: boolean;
  metadata: object;
  addInitializer: (fn: () => void) => void;
  access: { get: () => unknown };
};

export type MiddlewareDescriptor = {
  middlewares: (Ctr | Target)[];
};

export type MethodDescriptor = {
  context?: MethodContext;
  route: string;
  method: string;
  name: string;
};

export type ControllerDescriptor = InjectableDescriptor & {
  route: string;
  dependencies: Token[];
};

export type FeatureDescriptor = InjectableDescriptor & ModuleDescriptor & {
  route: string;
  controllers: Ctr[];
  features: Ctr[];
};

export function route<D extends ControllerDescriptor>(
  route: string,
): DescriptorFn {
  return (d: D) => {
    d.route = route;
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
//
// export const CreateMethod = createDescriptorCreator<MethodDescriptor>({
//   route: "",
//   method: "GET", // default method
// });
//
// export const CreateController = createDescriptorCreator<ControllerDescriptor>({
//   route: "",
//   dependencies: [] as Token[],
// });
//
// export const CreateFeature = createDescriptorCreator<FeatureDescriptor>({
//   // controller part
//   route: "",
//   controllers: [] as Ctr[],
//   // module part
//   imports: [] as Ctr[],
//   providers: [] as Provider[],
//   // feature part
//   features: [] as Ctr[],
//   // injectable part
//   dependencies: [] as Token[],
// });
//
// export const WebMeta = {
//   createMethod: createDescriptorCreator<MethodDescriptor>({
//     route: "",
//     method: "GET", // default method
//   }),
//
//   createMiddleware: createDescriptorCreator<MiddlewareDescriptor>({
//     middlewares: [] as (Ctr | Target)[],
//   }),
//
//   createController: createDescriptorCreator<ControllerDescriptor>({
//     route: "",
//     dependencies: [] as Token[],
//   }),
//
//   createFeature: createDescriptorCreator<FeatureDescriptor>({
//     imports: [] as Ctr[],
//     providers: [] as Provider[],
//     route: "",
//     controllers: [] as Ctr[],
//     features: [] as Ctr[],
//     dependencies: [] as Token[],
//   }),
//
//   setMethod(method: Target, descriptor: MethodDescriptor) {
//     write(method, MTD, descriptor);
//   },
//
//   setMiddleware(obj: Target, descriptor: MiddlewareDescriptor) {
//     write(obj, MDL, descriptor);
//   },
//
//   /**
//    * Set a module descriptor on a class.
//    * This function can be used to associate a module descriptor with a class.
//    *
//    * @param ctr
//    * @param descriptor
//    */
//   setController(ctr: Ctr, descriptor: ControllerDescriptor) {
//     Meta.setInjectable(ctr, descriptor);
//     write(ctr, CTR, descriptor);
//   },
//
//   setFeature(ctr: Ctr, descriptor: FeatureDescriptor) {
//     Meta.setModule(ctr, descriptor);
//     write(ctr, FET, descriptor);
//   },
//
//   getMethod: createGetMetadata<MethodDescriptor>(MTD, false),
//   getMiddleware: createGetMetadata<MethodDescriptor>(MDL),
//   getController: createGetMetadata<ControllerDescriptor>(CTR),
//   getFeature: createGetMetadata<FeatureDescriptor>(FET),
// };
