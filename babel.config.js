module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          alias: {
            "@screens": "./screens",
            "@helpers": "./helpers",
            "@features": "./features",
            "@components": "./components",
            "@assets": "./assets",
            "@app": "./app",
            "@api": "./api.js",
            "@socket": "./socket.js",
            "@theme": "./theme.js",
            "@countries.json": "./countries.json",
            "@language": "./language",
          },
        },
      ],
      "react-native-reanimated/plugin",
    ],
  };
};
