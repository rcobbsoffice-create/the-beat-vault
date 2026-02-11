module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { 
        jsxImportSource: "nativewind",
        unstable_transformImportMeta: true
      }],
    ],
    plugins: [
      require("react-native-css-interop/dist/babel-plugin").default,
      [
        "@babel/plugin-transform-react-jsx",
        {
          runtime: "automatic",
          importSource: "react-native-css-interop",
        },
      ],
      [
        "module-resolver",
        {
          root: ["."],
          alias: {
            "@": ".",
          },
        },
      ],
    ],
  };
};
