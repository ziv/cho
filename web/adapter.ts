import type { Any, Target } from "@chojs/core";
import { MethodArgFactory } from "@chojs/web";

export interface Adapter<
  Application = Any,
  Feature = Any,
  Controller = Any,
  Middleware = Any,
> {
  /**
   * Takes cho middleware and converts it to the framework's middleware
   * @param mw
   */
  createMiddleware(mw: (ctx: ChoContext, next: Next) => void): Middleware;

  /**
   * Takes cho endpoint handler and converts it to the framework's endpoint
   * @param mw
   * @param factory
   */
  createEndpoint(mw: Target, factory: MethodArgFactory): Middleware;

  /**
   * Takes cho controller and converts it to the framework's controller
   * @param mds
   */
  createController(mds: Middleware[]): Controller;

  /**
   * Takes cho feature and converts it to the framework's feature
   * @param mds
   */
  createFeature(mds: Middleware[]): Feature;

  /**
   * Mounts an endpoint to a controller
   * @param ctr
   * @param mws
   * @param endpoint
   * @param route
   * @param httpMethod
   */
  mountEndpoint(
    ctr: Controller,
    mws: Middleware[],
    endpoint: Middleware,
    route: string,
    httpMethod: string,
  ): void;

  /**
   * Mounts a controller to a feature
   * @param feat
   * @param controller
   * @param route
   */
  mountController(feat: Feature, controller: Controller, route: string): void;

  /**
   * Mounts a sub-feature to a feature
   * @param feat
   * @param feature
   * @param route
   */
  mountFeature(feat: Feature, feature: Feature, route: string): void;

  /**
   * Mounts a top-level feature to the application
   * @param feature
   */
  mountApp<R = Application>(feature: Feature): R;
}
