const Colors = {
  Cyan: "\x1b[36m%s\x1b[0m",
  Magenta: "\x1b[35m%s\x1b[0m",
  Red: "\x1b[31m%s\x1b[0m",
  Blue: "\x1b[34m%s\x1b[0m",
  Yellow: "\x1b[33m%s\x1b[0m",
  Green: "\x1b[32m%s\x1b[0m",
  Purple: "\x1b[35m%s\x1b[0m",
  BlueBright: "\x1b[94m%s\x1b[0m",
  RedBright: "\x1b[35m%s\x1b[0m",
  GreenBright: "\x1b[32m%s\x1b[0m",
};

export function color(message: string, name: keyof typeof Colors) {
  return Colors[name].replace("%s", message);
}

export function colorIndex(message: string, index: number) {
  const keys = Object.keys(Colors);
  const key = keys[index % keys.length] as keyof typeof Colors;
  return color(message, key);
}

export function hash(text: string, mod = 10) {
  return text.split("").reduce((acc, cur) => acc + cur.charCodeAt(0), 0);
}
