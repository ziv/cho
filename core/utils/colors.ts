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
