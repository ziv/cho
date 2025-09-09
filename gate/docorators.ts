import { createMethodDecorator } from "@chojs/web/meta";

/**
 * Gateway class decorator for marking a class as a message broker gateway.
 * Gateways handle communication with message brokers like Redis, NATS, MQTT, etc.
 *
 * Gateway is the equivalent of Controller in web applications.
 *
 * ```ts
 * @Gateway()
 * class RedisGateway {}
 * ```
 * @param type
 * @constructor
 */
export function Gateway(type: string) {
}

/**
 * Method decorator for listening to messages from a message broker and replying to them.
 *
 * @example
 * ```ts
 * class MyController {
 *   @Message("event.name")
 *   streamEvents(stream, context) { ... }
 * }
 * ```
 */
const Message = createMethodDecorator("Message");

/**
 * Method decorator for listening to events (messages) from a message broker
 *
 * @example
 * ```ts
 * class MyController {
 *   @Event("event.name")
 *   streamEvents(stream, context) { ... }
 * }
 * ```
 */
const Event = createMethodDecorator("Event");
