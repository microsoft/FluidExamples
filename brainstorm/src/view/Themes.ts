import { createTheme } from "@fluentui/react";

export type ThemeName = "default" | "dark" | "contrast";

export function normalizeThemeName(theme?: string): ThemeName {
  switch (theme) {
    case "dark":
      return "dark";
    case "contrast":
      return "contrast";
    default:
      return "default";
  }
}

export function themeNameToTheme(themeName: ThemeName) {
  switch (themeName) {
    case "default":
      return lightTheme;
    case "dark":
      return darkTheme;
    case "contrast":
      return darkTheme;
  }
}

export const lightTheme = createTheme({
  palette: {
    themePrimary: "#6264a7",
    themeLighterAlt: "#f7f7fb",
    themeLighter: "#e1e1f1",
    themeLight: "#c8c9e4",
    themeTertiary: "#989ac9",
    themeSecondary: "#7173b0",
    themeDarkAlt: "#585a95",
    themeDark: "#4a4c7e",
    themeDarker: "#37385d",
    neutralLighterAlt: "#faf9f8",
    neutralLighter: "#f3f2f1",
    neutralLight: "#edebe9",
    neutralQuaternaryAlt: "#e1dfdd",
    neutralQuaternary: "#d0d0d0",
    neutralTertiaryAlt: "#c8c6c4",
    neutralTertiary: "#b9b8b7",
    neutralSecondary: "#a2a1a0",
    neutralPrimaryAlt: "#8b8a89",
    neutralPrimary: "#30302f",
    neutralDark: "#5e5d5c",
    black: "#474645",
    white: "#ffffff",
  },
});

export const darkTheme = createTheme({
  isInverted: true,
  palette: {
    themePrimary: "#6264a7",
    themeLighterAlt: "#040407",
    themeLighter: "#10101b",
    themeLight: "#1d1e32",
    themeTertiary: "#3b3c63",
    themeSecondary: "#565892",
    themeDarkAlt: "#6e70af",
    themeDark: "#8183bb",
    themeDarker: "#9ea0cd",
    neutralLighterAlt: "#000000",
    neutralLighter: "#000000",
    neutralLight: "#000000",
    neutralQuaternaryAlt: "#000000",
    neutralQuaternary: "#000000",
    neutralTertiaryAlt: "#000000",
    neutralTertiary: "#c8c8c8",
    neutralSecondary: "#d0d0d0",
    neutralPrimaryAlt: "#dadada",
    neutralPrimary: "#ffffff",
    neutralDark: "#f4f4f4",
    black: "#f8f8f8",
    white: "#000000",
  },
});
