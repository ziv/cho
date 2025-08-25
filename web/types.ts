import type { Any, Ctr, Injector, Instance, Target } from "@chojs/core/di";



export type ChoMiddlewareDescriptor = Target; // todo fix with the right signature

export type ChoMethodDescriptor = MethodDescriptor & {
  middlewares: ChoMiddlewareDescriptor[];
};
export type ChoControllerDescriptor = ControllerDescriptor & {
  /**
   * The instance of the controller.
   */
  controller: Instance;
  methods: ChoMethodDescriptor[];
  middlewares: ChoMiddlewareDescriptor[];
};

export type ChoFeatureDescriptor = FeatureDescriptor & {
  injector: Injector;
  controllers: ChoControllerDescriptor[];
  features: ChoFeatureDescriptor[];
  middlewares: ChoMiddlewareDescriptor[];
};

export interface ModuleInit {
  init(): Promise<void>;
}

export interface ModuleMount {
  mount(): Promise<void>;
}

export interface MiddlewareClass {
  handle(ctx: Any, next: Target): Promise<void> | void;
}
