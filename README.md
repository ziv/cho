# CHO

    Under development - not production ready!

CHO is a tiny decorators based framework for building modular applications. It utilizes modern JavaScript decorators (
see [About Javascript Decorators](#about-javascript-decorators)) to provide a clean and efficient way to define
application structure.

The concept is inspired by Angular, NestJS, and Spring but with a different approach:

### Standard

Use the language standard features (or in our case, stage 3 decorators proposal).

### Engine Agnostic

The framework does not depend on any engine and on the environment (Node.js, Deno, Bun, Cloudflare Workers, etc.).

### Minimal

Provide a shallow set of decorators, and provide a set of functions to extend the decorators functionality. Enough to
build a modular application.

---

## About Javascript Decorators

This project use the TC39 stage 3 decorators proposal (JavaScript decorators).

The JavaScript decorators are different from TypeScript decorators, and they are not compatible with each other. For
more information, see:

- [decorators.deno.dev](https://decorators.deno.dev/)
- [Typescript Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)
- [TC39 stage 3 proposal](https://github.com/tc39/proposal-decorators)

## Notes about documentation

I'm using `deno doc` to generate the documentation. It has a bug that identifies decorators as jsdoc. So I'm using
`〇Injectable` instead of `@Injectable` in the comments to avoid this issue. `fix-docs.sh` script fix the generated
documentation.

<img src="./assets/cho.svg"  alt="CHO" width="200"/>

soon...
