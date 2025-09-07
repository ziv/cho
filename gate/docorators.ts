import { createMethodDecorator } from "@chojs/web/decorators.ts";

/**
 * @example
 *
 * ```ts
 * @Gateway("redis")
 * class RedisGateway {}
 * ```
 * @param type
 * @constructor
 */
export function Gateway(type: string) {
}

const FFF = createMethodDecorator("FFF");
