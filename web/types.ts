/**
 * A middleware must implement a `handle` method that takes any arguments
 */
export interface Middleware {
    handle(...args: any[]): any;
}