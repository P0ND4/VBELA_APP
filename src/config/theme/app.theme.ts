export interface Colors {
  primary: string;
  background: string;
  card: string;
  text: string;
  border: string;
  notification: string;
}

export interface Theme {
  dark: boolean;
  colors: Colors;
}

const colors: string[] = ["#1E90FF", "#E38B00", "#30AA21", "#AD32B2", "#BD0900"];

type ThemeConfig = { color?: number; darkMode?: boolean };

export default ({ color = 0, darkMode = false }: ThemeConfig): Theme => {
  if (color > colors.length - 1 || color < 0)
    throw new Error(`Índice fuera de rango [0,${colors.length - 1}]`);

  return {
    dark: darkMode,
    colors: {
      primary: colors[color],
      background: darkMode ? "#000000" : "#FFFFFF",
      card: darkMode ? "#111111" : "#EEEEEE",
      text: darkMode ? "#FFFFFF" : "#000000",
      border: darkMode ? "#BDBDBD" : "#DDDDDD",
      notification: darkMode ? "#111111" : "#EEEEEE",
    },
  };
};
