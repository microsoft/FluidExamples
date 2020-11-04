import React, { FC } from "react";
import { IItem } from "../fluid-object/interfaces";
import { Button } from "./Button";

interface ItemProps {
  items: IItem[];
  demo: () => string;
  createItem: (string) => void;
}

export const List: FC<ItemProps> = (props) => {
  const createItem = () => {
    props.createItem(props.demo());
  };

  return (
    <div className="board">
      {props.items.map((item) => (
        <label className="item">
          <input type="radio"></input>
          <span className="note-text">{item.text}</span>
        </label>
      ))}
      <Button onClick={createItem}> Create a new Item </Button>
    </div>
  );
};
