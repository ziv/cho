# CHO

    Under development - not production ready!

[![Release](https://github.com/ziv/cho/actions/workflows/release.yml/badge.svg)](https://github.com/ziv/cho/actions/workflows/release.yml)

CHO is a tiny decorators based framework for building modular applications. It utilizes modern JavaScript decorators (
see [About Javascript Decorators](#about-javascript-decorators)) to provide a clean and efficient way to define
application structure.

The concept is inspired by Angular, NestJS, and Spring but with a different approach:

### Standard

Use the language standard features (or in our case, stage 3 decorators proposal).

### Engine Agnostic

The framework does not depend on any engine and on the environment (Node.js, Deno, Bun, Cloudflare Workers, etc.).

### Minimal

Provide only the essential features to build modular applications.

---

## About Javascript Decorators

This project use the TC39 stage 3 decorators proposal (JavaScript decorators).

The JavaScript decorators are different from TypeScript decorators, and they are not compatible with each other. For
more information, see:

- [TC39 stage 3 proposal](https://github.com/tc39/proposal-decorators)
- [Typescript Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)
- [decorators.deno.dev](https://decorators.deno.dev/)

<img src="./assets/cho.svg"  alt="CHO" width="200"/>

soon...

Dev:

```shell
docker run -d --name=kafka -p 9092:9092 apache/kafka
```
