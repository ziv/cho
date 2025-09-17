import {
  addToMetadataObject,
  ClassMethodDecorator,
  Target,
} from "../core/mod.ts";

/**
 * Mark a method as the main command handler.
 * The main command is executed when no sub-command is provided.
 * @constructor
 */
export function Main(): ClassMethodDecorator {
  return (target: Target) => {
    addToMetadataObject(target, { command: "main" });
  };
}

/**
 * Define a sub-command handler method.
 * @param name
 * @constructor
 */
export function Command(name: string): ClassMethodDecorator {
  return (target: Target) => {
    addToMetadataObject(target, { command: name });
  };
}

export function Help(content: string) {
  return (target: Target) => {
    addToMetadataObject(target, { help: content });
  };
}
