# CHO

Under development - not production ready!

## About Javascript Decorators

This package use the TC39 stage 3 decorators proposal (JavaScript decorators).

The JavaScript decorators are different from TypeScript decorators, and they are not compatible with each other. For
more information, see:

- [decorators.deno.dev](https://decorators.deno.dev/)
- [Typescript Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)
- [TC39 stage 3 proposal](https://github.com/tc39/proposal-decorators)

<img src="./assets/cho.svg"  alt="CHO" width="200"/>

## Cho

A tiny **_decorators_** based framework for applications. The concept is inspired by Angular, NestJS, and Spring but
with a different approach:

### Standard

Use the language standard features (or in our case, stage 3 decorators proposal with implementation).

### Engine Agnostic

The framework does not depend on any engine and on the environment (Node.js, Deno, Bun, Browser, etc.).

### Minimal

Provide a shallow set of features, enough to build a modular application.

---

Soon...

### Notes about documentation

I'm using `deno doc` to generate the documentation. It has a bug that identifies decorators as jsdoc. So I'm using
`〇Injectable` instead of `@Injectable` in the comments to avoid this issue. `fix-docs.sh` script fix the generated
documentation.
