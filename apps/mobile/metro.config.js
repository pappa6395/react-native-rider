const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const defaultConfig = getDefaultConfig(__dirname);

// Ensure `extraNodeModules` is properly set for web
defaultConfig.resolver.extraNodeModules = {
  "react-native-maps": require.resolve("./mocks/react-native-maps.js"),
  "react-native/Libraries/Utilities/Platform": require.resolve("./mocks/platform.js"),
  "react-native/Libraries/Utilities/codegenNativeCommands": require.resolve("./mocks/codegenNativeCommands.js"),
};

// Merge NativeWind config properly
const finalConfig = withNativeWind(defaultConfig, { input: "./app/global.css" });

module.exports = finalConfig;
