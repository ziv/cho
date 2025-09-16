import { createMethodDecorator } from "@chojs/web/meta";
import type { Routed } from "@chojs/web";
import { addToMetadataObject, type InjectableDescriptor } from "@chojs/core";

// todo temporary list of supported gateway types
// const GatewayTypes = {
//   Redis: "redis",
//   NATS: "nats",
//   MQTT: "mqtt",
//   RabbitMQ: "rabbitmq",
//   Kafka: "kafka",
// } as const;
// export type GatewayTypesKey = keyof typeof GatewayTypes;
// export type GatewayType = "redis" | "nats" | "mqtt" | "rabbitmq" | "kafka";

export type GatewayDescriptor =
  & InjectableDescriptor
  & Partial<Pick<Routed, "middlewares">>;

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
 * @constructor
 * @param desc
 */
export function Gateway(desc: GatewayDescriptor) {
  return (target: Function) => {
    const data = {
      type: desc.type,
      middlewares: desc?.middlewares ?? [],
      deps: desc?.deps ?? [],
    };
    addToMetadataObject(target, data);
  };
}

/**
 * Method decorator for listening to messages from a message broker and replying to them.
 *
 * @example
 * ```ts
 * class MyGateway {
 *   @MessageListener("event.name")
 *   streamEvents(stream, context) { ... }
 * }
 * ```
 */
const MessageListener = createMethodDecorator<any, GatewayType>("Message");

/**
 * Method decorator for listening to events (messages) from a message broker
 *
 * @example
 * ```ts
 * class MyGateway {
 *   @EventListener("event.name")
 *   streamEvents(stream, context) { ... }
 * }
 * ```
 */
const EventListener = createMethodDecorator<any, GatewayType>("Event");
