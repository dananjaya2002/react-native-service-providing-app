// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

/** @type {import('expo/metro-config').MetroConfig} */
module.exports = withNativeWind(config, { input: "./global.css" });

config.resolver.sourceExts.push("sql");
