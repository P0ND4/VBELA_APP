import theme from "@theme";
const { light, dark } = theme();

export const calendarTheme = (mode) => ({
  // PARA PRESENTATION presentation/components/calendar/theme.ts
  backgroundColor: mode === "light" ? light.main5 : dark.main2,
  calendarBackground: mode === "light" ? light.main5 : dark.main2,
  textSectionTitleColor: light.main2,
  textSectionTitleDisabledColor: "#d9e1e8",
  selectedDayBackgroundColor: "#00adf5",
  selectedDayTextColor: "#ffffff",
  todayTextColor: light.main2,
  dayTextColor: mode === "light" ? light.textDark : dark.textWhite,
  textDisabledColor: `${mode === "light" ? light.textDark : dark.textWhite}66`,
  dotColor: "#00adf5",
  selectedDotColor: "#ffffff",
  arrowColor: mode === "light" ? light.textDark : dark.textWhite,
  disabledArrowColor: `${light.main2}66`,
  monthTextColor: mode === "light" ? light.textDark : dark.textWhite,
  indicatorColor: mode === "light" ? light.textDark : dark.textWhite,
  textDayFontFamily: "monospace",
  textMonthFontFamily: "monospace",
  textDayHeaderFontFamily: "monospace",
  textDayFontWeight: "300",
  textMonthFontWeight: "bold",
  textDayHeaderFontWeight: "300",
  textDayFontSize: 16,
  textMonthFontSize: 18,
  textDayHeaderFontSize: 16,
});
