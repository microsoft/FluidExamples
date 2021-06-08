import { ColorId } from "../Types";

export type ColorValues = { base: string; dark: string; light: string };

export const ColorOrder: ColorId[] = [
  "Blue",
  "Green",
  "Yellow",
  "Pink",
  "Purple",
  "Orange",
];

export const DefaultColor = ColorOrder[0];

export const ColorOptions: { [key in ColorId]: ColorValues } = {
  Blue: { base: "#0078D4", dark: "#99C9EE", light: "#CCE4F6" },
  Green: { base: "#005E50", dark: "#99BFB9", light: "#CCDFDC" },
  Yellow: { base: "#F2C811", dark: "#FAE9A0", light: "#FCF4CF" },
  Pink: { base: "#E3008C", dark: "#F499D1", light: "#F9CCE8" },
  Purple: { base: "#8764B8", dark: "#CFC1E3", light: "#E7E0F1" },
  Orange: { base: "#CA5010", dark: "#EAB99F", light: "#F4DCCF" },
};
