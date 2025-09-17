export type ChoArgs = {
    _: string[];
    [key: string]: unknown;
};

export class ChoCommandContext {
    constructor(readonly args: ChoArgs) {
    }
}
