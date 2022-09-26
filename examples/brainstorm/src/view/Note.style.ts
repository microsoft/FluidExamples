import { IRawStyle, IStyle, ITooltipHostStyles, IButtonStyles } from '@fluentui/react';
import { ColorOptions } from "./Color";
import { ColorId } from "../Types";

export const NOTE_SIZE = {
  width: 300,
  height: 100
}

export const tooltipHostStyle: Partial<ITooltipHostStyles> = {
  root: { display: "inline-block" },
};

export const iconStyle: React.CSSProperties = {
  color: "black",
  fontSize: "10px",
};

export const deleteButtonStyle: IButtonStyles = {
  root: { backgroundColor: "transparent" },
  rootHovered: { backgroundColor: "transparent" },
  rootPressed: { backgroundColor: "transparent" },
  icon: { fontSize: "13px" },
  iconHovered: { fontSize: "15px" }
};

export const colorButtonStyle: IButtonStyles = {
  root: { backgroundColor: "transparent " },
  rootHovered: { backgroundColor: "transparent" },
  rootPressed: { backgroundColor: "transparent" },
  rootExpanded: { backgroundColor: "transparent" },
  rootExpandedHovered: { backgroundColor: "transparent" },
  iconHovered: { fontSize: "18px" },
  iconExpanded: { fontSize: "18px" }
};

export const likesButtonStyle: IButtonStyles = {
  root: { backgroundColor: "transparent" }, 
  rootHovered: { backgroundColor: "transparent", fontSize: "18px" }, 
  rootPressed: { backgroundColor: "transparent" }, 
  iconHovered: { fontSize: "18px" }
};

export function getRootStyleForColor(color: ColorId): IStyle {
  return {
    background: ColorOptions[color].light,
    position: "absolute",
    borderRadius: "2px",
    boxShadow:
      "rgb(0 0 0 / 13%) 0px 1.6px 3.6px 0px, rgb(0 0 0 / 11%) 0px 0.3px 0.9px 0px",
    width: NOTE_SIZE.width,
    minHeight: NOTE_SIZE.height
  };
}

export function getHeaderStyleForColor(color: ColorId): IRawStyle {
  if (color === undefined) {
    return { backgroundColor: ColorOptions["Blue"].dark };
  }
  return { backgroundColor: ColorOptions[color].dark };
}
