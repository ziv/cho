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

export function indexed(message: string, index: number) {
  return `\x1b[${
    IndexedColors[index % IndexedColors.length]
  }m${message}\x1b[0m`;
}

export const red = createPainter("red");
export const green = createPainter("green");
export const yellow = createPainter("yellow");
export const blue = createPainter("blue");
export const magenta = createPainter("magenta");
export const cyan = createPainter("cyan");
export const white = createPainter("white");
export const gray = createPainter("gray");

// const Colors = {
//   Cyan: "\x1b[36m%s\x1b[0m",
//   Yellow: "\x1b[33m%s\x1b[0m",
//   Magenta: "\x1b[35m%s\x1b[0m",
//
//   Red: "\x1b[31m%s\x1b[0m",
//   Green: "\x1b[32m%s\x1b[0m",
//   Blue: "\x1b[34m%s\x1b[0m",
//
//   Purple: "\x1b[35m%s\x1b[0m",
//   BlueBright: "\x1b[94m%s\x1b[0m",
//   RedBright: "\x1b[35m%s\x1b[0m",
//   GreenBright: "\x1b[32m%s\x1b[0m",
// };
//
// export function red(message: string) {
//   return `\x1b[31m${message}\x1b[0m`;
// }
//
// export function green(message: string) {
//   return `\x1b[32m${message}\x1b[0m`;
// }
// export function yellow(message: string) {
//   return `\x1b[33m${message}\x1b[0m`;
// }
// export function blue(message: string) {
//   return `\x1b[34m${message}\x1b[0m`;
// }
// export function magenta(message: string) {
//   return `\x1b[35m${message}\x1b[0m`;
// }
// export function cyan(message: string) {
//   return `\x1b[36m${message}\x1b[0m`;
// }
// export function white(message: string) {
//   return `\x1b[37m${message}\x1b[0m`;
// }
// export function gray(message: string) {
//   return `\x1b[90m${message}\x1b[0m`;
// }
// export function reset(message: string) {
//   return `\x1b[0m${message}\x1b[0m`;
// }
