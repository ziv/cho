/**
 * Command context
 * Minimist args API
 */
export type ChoArgs = {
  _: string[];
  [key: string]: unknown;
};

/**
 * Command context
 * Provide access to args and other context data
 */
export class ChoCommandContext {
  constructor(readonly args: ChoArgs) {
  }
}
