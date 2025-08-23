# CHO

<img src="./assets/cho.svg"  alt="CHO" width="200"/>

Under development - not production ready!

## Modern Decorators

A tiny decorators based framework using the [TC39 stage 3 proposal](https://github.com/tc39/proposal-decorators)
decorators.

The JS decorators are different from TypeScript decorators, and they are not compatible with each other.
For more information, see [decorators.deno.dev](https://decorators.deno.dev/).

    JS decorators can not be applied on arguments, while TS ones can.

#### Example

An Angular like example:

```ts

@Injectable()
class Service {
    // this type of decorator (argument decorator) does not 
    // exists in JS decorators
    constructor(@Inject() private dep: Dep,
                @Inject('config') private config: Config) {
    }
}
```

Lack of this feature in JS decorators requires a different approach - being more verbose. With `CHO`, defining
dependencies
is done using the
`dependsOn()` function in the class decorator.

```ts
import {dependsOn, Injectable} from '@cho/core/di';

@Injectable(dependsOn(Dep, 'config'))
class Service {
    constructor(private dep: Dep,
                private config: Config) {
    }
}
```
