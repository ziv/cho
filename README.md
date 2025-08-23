# CHO

<img src="./assets/cho.svg"  alt="CHO" width="200"/>

## Decorators

A tiny decorators based framework using the [TC39 stage 3 proposal](https://github.com/tc39/proposal-decorators) for
decorators and at [decorators.deno.dev](https://decorators.deno.dev/).

The JS decorators are different from TypeScript decorators, and they are not compatible with each other.

    JS decorators can not be applied on arguments, while TS ones can.

#### Example

An Angular like example:

````ts

@Injectable()
class Service {
    // this type of decorator (argument decorator) does not 
    // exists in JS decorators
    constructor(@Inject() private dep: Dep) {
    }
}
````

Lack of this feature in JS decorators requires a different approach - being more verbose. With `CHO`, defining dependencies
is done using the
`dependsOn()` function in the class decorator.

````ts
import {Injectable} from '@cho/core/di/decorators.ts';
import {dependsOn} from '@cho/core/di/fn.ts';

@Injectable(dependsOn(Dep))
class Service {
    constructor(private dep: Dep) {
    }
}
````