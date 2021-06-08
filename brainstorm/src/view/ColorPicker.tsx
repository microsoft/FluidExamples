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
  // @ts-ignore
  const onChange = (_event, id) => {
    props.parent.current.dismissMenu();
    setColor(id)
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