import React, { FC, useEffect, useState } from "react";
import { IItem, IUser, UserType } from "../fluid-object/interfaces";
import { Button } from "./Button";

interface ItemProps {
  items: IItem[];
  demo: () => string;
  createItem: (string) => void;
  submit: (string) => void;
  user: IUser;
  title: string;
}

export const List: FC<ItemProps> = (props) => {
  const [value, setValue] = useState<string>("");
  const [isDesignPageEditView, setIsDesignPageEditView] = useState<boolean>(false);
  const [isMouseInDesignEdit, setIsMouseInDesignEdit] = useState<boolean>(false);

  const createItem = () => {
    props.createItem(props.demo());
  };

  const submit = () => {
    props.submit(value);
    console.log(value);
  };

  const clickItem = (value: string) => {
    setValue(value);
  }

  const clickDesignView = () => {
    setIsDesignPageEditView(true);
  }

  const mouseEnter = () => {
    if (isDesignPageEditView) {
      setIsMouseInDesignEdit(true);
    }
  }

  const mouseOut = () => {
    if (isDesignPageEditView) {
      setIsMouseInDesignEdit(false);
    }
  }

  const mouseUp = React.useCallback(() => {
    if (isDesignPageEditView && !isMouseInDesignEdit) {
      setIsDesignPageEditView(false);
    }
  }, [isDesignPageEditView, isMouseInDesignEdit]);

  useEffect(() => {
    document.body.addEventListener('mouseup', mouseUp);

    return function cleanup() {
      document.body.removeEventListener('mouseup', mouseUp);
    }
  }, [mouseUp]);

  return (
    <div>
      <div className="design" hidden={props.user.userType != UserType.designer}>
        <div className="designEdit" hidden={!isDesignPageEditView} onMouseEnter={mouseEnter} onMouseOut={mouseOut}>
          <input className="radio-button" value={props.title} placeholder={props.title ? "" : "Please input title here"}></input>
          <li className="option-list">
            {props.items.map((item) => (
              <label className="item">
                <input className="radio-button" type="radio" name="option" disabled></input>
                <input value={item.text}></input>
              </label>
            ))}
            <Button onClick={createItem}> +  Add option </Button>
          </li>
        </div>
        <div className="designView" hidden={isDesignPageEditView} onClick={clickDesignView}>
          <span className="title">{props.title}</span>
          <li className="option-list">
            {props.items.map((item) => (
              <label className="item">
                <input className="radio-button" type="radio" name="option" disabled></input>
                <span className="note-text">{item.text}</span>
              </label>
            ))}
            <Button onClick={createItem}> +  Add option </Button>
          </li>
        </div>
      </div>
      <div className="response" hidden={props.user.userType == UserType.designer}>
        <span className="title">{props.title}</span>
        {props.items.map((item) => (
          <label className="item">
            <input className="radio-button" type="radio" name="option" onClick={() => clickItem(item.text)}></input>
            <span className="note-text">{item.text}</span>
          </label>
        ))}
        <Button onClick={submit}> Submit </Button>
      </div>
    </div >
  );
};
