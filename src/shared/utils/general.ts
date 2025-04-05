import chroma from "chroma-js";

type Option = boolean | undefined;

interface Options {
  upperCase?: Option;
  lowerCase?: Option;
  number?: Option;
  symbols?: Option;
}

export const random = (
  repeat: number = 10,
  options: Options = { upperCase: true, lowerCase: true },
): string => {
  const { upperCase, lowerCase, number, symbols }: Options = options;

  let possible = "";

  if (upperCase) possible += "ABCDEFGHIJKMNLOPQRSTUVWXYZ";
  if (lowerCase) possible += "abcdefghijkmnlopqrstuvwxyz";
  if (number) possible += "0123456789";
  if (symbols) possible += "!@#$%^&*()_+=-/*,.";

  const randomString = Array.from({ length: repeat }, () =>
    possible.charAt(Math.floor(Math.random() * possible.length)),
  ).join("");

  return randomString;
};

export const generatePalette = (baseColor: string, size: number = 5): string[] => {
  const randomColor = () => chroma.random().hex();
  const base = chroma(baseColor || randomColor());

  return Array.from({ length: size }, (_, i) =>
    base
      .set("hsl.h", `+${(360 / size) * i * 1.3}`)
      .set("hsl.l", `${0.45 + Math.random() * 0.1}`)
      .set("hsl.s", `${0.6 + Math.random() * 0.3}`)
      .hex(),
  );
};
