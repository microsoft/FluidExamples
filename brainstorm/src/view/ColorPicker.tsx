import React from "react";
import { SwatchColorPicker, IColorCellProps } from "@fluentui/react";
import {  ColorOptions, ColorOrder } from "./Color";
import { ColorId } from "../Types";


export type ColorButtonProps = {
  parent?: any,
  selectedColor: ColorId;
  setColor: (color: ColorId) => void;
};

export function ColorPicker(props: ColorButtonProps) {
  const { selectedColor, setColor } = props;
  const colorCells = ColorOrder.map((id) => colorOptionToCell(id));
  const onChange = (_event: React.FormEvent<HTMLElement>, colorId: string | undefined) => {
    props.parent.current.dismissMenu();
    setColor(colorId as ColorId);
  };
  return (
    <SwatchColorPicker
      columnCount={6}
      colorCells={colorCells}
      defaultSelectedId={selectedColor}
      onChange={onChange}
    />
  );
}

function colorOptionToCell(id: ColorId): IColorCellProps {
  return {
    id: id,
    color: ColorOptions[id].dark,
  };
}