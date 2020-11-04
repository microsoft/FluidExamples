import React, { FC, useState } from "react";
import { IItem, IUser, UserType } from "../fluid-object/interfaces";
import { Button } from "./Button";

interface ItemProps {
  items: IItem[];
  demo: () => string;
  createItem: (string) => void;
  submit: (string) => void;
  user: IUser;
}

export const List: FC<ItemProps> = (props) => {
  const [value, setValue] = useState<string>("");

  const createItem = () => {
    props.createItem(props.demo());
  };

  const submit = () => {
    props.submit(value);
  };

  const clickItem = () => {
    setValue("sample");
  }

  return (
    <div className="board">
      <li className="option-list">
      {props.items.map((item) => (
        <label className="item">
          <input type="radio" name="option" onClick={clickItem} disabled={props.user.userType == UserType.designer}></input>
          <span className="note-text">{item.text}</span>
        </label>
      ))}
      {props.user.userType == UserType.designer && <Button onClick={createItem}> Add option </Button>}
      {props.user.userType == UserType.responder && <Button onClick={submit}> Submit </Button>}
      </li>
    </div>
  );
};
