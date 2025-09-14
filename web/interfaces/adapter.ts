import { Any, Target } from "@chojs/core"
import {Context} from "./context.ts";

export type Next = () => void | Promise<void>;
export type MethodArgFactory = (ctx: Context) => Promise<Any[]>;

/**
 * Function type for middleware that processes request context and calls next.
 */
export type Middleware = (
    ctx: Context,
    next: Next,
) => void | Response | Promise<void | Response>;

/**
 * The main adapter interface that all framework adapters should implement
 * The extended adapter includes optional methods for specialized adapters
 */
export type Adapter<
    Application = Any,
    Feature = Any,
    Controller = Any,
    Middleware = Any,
    Ctx = Any,
> = {
    createContext(raw: Ctx): Context;

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
    // createEndpoint(mw: Target, factory: MethodArgFactory): Middleware;

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
     * @param errorHandler
     */
    mountController(feat: Feature, controller: Controller, route: string, errorHandler?: Target): void;

    /**
     * Mounts a sub-feature to a feature
     * @param feat
     * @param feature
     * @param route
     * @param errorHandler
     */
    mountFeature(feat: Feature, feature: Feature, route: string, errorHandler?: Target): void;

    /**
     * Mounts a top-level feature to the application
     * @param feature
     * @param route
     */
    mountApp<R = Application>(feature: Feature, route: string): R;
};