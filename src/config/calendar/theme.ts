type Colors = {
  primary: string;
  background: string;
  card: string;
  text: string;
  border: string;
  notification: string;
};

export default (colors: Colors) => ({
  backgroundColor: colors.background,
  calendarBackground: colors.background,
  textSectionTitleColor: colors.primary,
  todayTextColor: colors.primary,
  dayTextColor: colors.text,
  arrowColor: colors.text,
  monthTextColor: colors.text,
  indicatorColor: colors.text,
  selectedDayBackgroundColor: colors.primary,
  selectedDayTextColor: "#ffffff",
});
