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
