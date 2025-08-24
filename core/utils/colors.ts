const Color = {
  cyan: 36,
  yellow: 33,
  magenta: 35,
  red: 31,
  green: 32,
  blue: 34,
  purple: 35,
  blueBright: 94,
  redBright: 35,
  greenBright: 32,
  white: 37,
  gray: 90,
  // reset: 0,
};

const IndexedColors = Object.values(Color).filter((x) => x !== 90);

function createPainter(color: keyof typeof Color) {
  return (message: string) => `\x1b[${Color[color]}m${message}\x1b[0m`;
}

/**
 * Applies a deterministic ANSI color from a small palette based on the given index.
 * Useful for coloring lists/logs consistently.
 * @param message The text to colorize.
 * @param index The index used to rotate through the palette.
 * @example
 * ```ts
 * const items = ["alpha", "beta", "gamma"];
 * items.forEach((name, i) => console.log(indexed(name, i)));
 * ```
 */
export function indexed(message: string, index: number) {
  return `\x1b[${
    IndexedColors[index % IndexedColors.length]
  }m${message}\x1b[0m`;
}

/**
 * Red color function.
 * Returns the input string wrapped in ANSI escape codes for red color.
 *
 * @example
 * ```ts
 * console.log(red("This is a red message"));
 * ```
 */
export const red = createPainter("red");

/**
 * Green color function.
 * Returns the input string wrapped in ANSI escape codes for green color.
 * @example
 * ```ts
 * console.log(green("This is green"));
 * ```
 */
export const green = createPainter("green");

/**
 * Yellow color function.
 * Returns the input string wrapped in ANSI escape codes for yellow color.
 * @example
 * ```ts
 * console.log(yellow("This is yellow"));
 * ```
 */
export const yellow = createPainter("yellow");

/**
 * Blue color function.
 * Returns the input string wrapped in ANSI escape codes for blue color.
 * @example
 * ```ts
 * console.log(blue("This is blue"));
 * ```
 */
export const blue = createPainter("blue");

/**
 * Magenta color function.
 * Returns the input string wrapped in ANSI escape codes for magenta color.
 * @example
 * ```ts
 * console.log(magenta("This is magenta"));
 * ```
 */
export const magenta = createPainter("magenta");

/**
 * Cyan color function.
 * Returns the input string wrapped in ANSI escape codes for cyan color.
 * @example
 * ```ts
 * console.log(cyan("This is cyan"));
 * ```
 */
export const cyan = createPainter("cyan");

/**
 * White color function.
 * Returns the input string wrapped in ANSI escape codes for white color.
 * @example
 * ```ts
 * console.log(white("This is white"));
 * ```
 */
export const white = createPainter("white");

/**
 * Gray color function.
 * Returns the input string wrapped in ANSI escape codes for gray color.
 * @example
 * ```ts
 * console.log(gray("This is gray"));
 * ```
 */
export const gray = createPainter("gray");
