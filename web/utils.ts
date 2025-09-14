/**
 * Check if a value is a class constructor.
 *
 * @example
 * ```ts
 * class MyClass {}
 * function myFunction() {}
 *
 * console.log(isClass(MyClass));
 * // true
 * console.log(isClass(myFunction));
 * // false
 * console.log(isClass({}));
 * // false
 * ```
 * @param v
 */
export function isClass(v: unknown) {
  if (typeof v !== "function") {
    return false;
  }
  const descriptor = Object.getOwnPropertyDescriptor(v, "prototype");
  return descriptor && descriptor.writable === false;
}
