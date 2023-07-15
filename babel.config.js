module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "react-native-reanimated/plugin",
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
            "@version.json": "./version.json",
            "@countries.json": "./countries.json"
          },
        },
      ],
    ],
  };
};
