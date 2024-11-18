module.exports = {
  extends: ["expo", "prettier"],
  plugins: ["prettier"],
  rules: {
    "prettier/prettier": [
      "error",
      {
        endOfLine: "auto",
        printWidth: 100,
      },
    ],
    "react-hooks/exhaustive-deps": "off",
  },
};
