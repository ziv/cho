import type { Any, Target } from "@chojs/core";
import type { MethodArgFactory, Middleware, Next } from "./types.ts";
import type { Context } from "./context.ts";

export interface StreamAdapter {
  /**
   * Takes cho streaming endpoint handler and converts it to the framework's streaming endpoint
   * @param mw
   * @param factory
   */
  createStreamEndpoint(mw: Target, factory: MethodArgFactory): Middleware;
}

export interface SseAdapter {
  /**
   * Takes cho SSE endpoint handler and converts it to the framework's streaming endpoint
   * The endpoint handler should be an async generator function
   *
   * @param mw
   * @param factory
   */
  createSseEndpoint(mw: Target, factory: MethodArgFactory): Middleware;
}

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
  createMiddleware(mw: (ctx: Context, next: Next) => void): Middleware;

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
   * @param route
   */
  mountApp<R = Application>(feature: Feature, route: string): R;
}

export type Adapters = Adapter & Partial<StreamAdapter & SseAdapter>;
