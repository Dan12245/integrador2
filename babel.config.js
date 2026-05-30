module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      '@babel/plugin-proposal-export-namespace-from',
      'react-native-worklets/plugin', //it has to be last in the list of plugins
    ]
  };
};