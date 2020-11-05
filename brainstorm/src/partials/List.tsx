import React, { FC, useEffect, useState } from "react";
import { IItem, IUser, UserType } from "../fluid-object/interfaces";
import { Button } from "./Button";

interface ItemProps {
  items: IItem[];
  createItem: (string) => void;
  submit: (string) => void;
  createOrChangeTitle: (string) => void;
  changeItem: (IItem, string) => void;
  user: IUser;
  title: string;
  getSubmitCount: () => number;
  getSubmitIds: () => string[];
}

export const List: FC<ItemProps> = (props) => {
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [isDesignPageEditView, setIsDesignPageEditView] = useState<boolean>(false);
  const [isMouseInDesignEdit, setIsMouseInDesignEdit] = useState<boolean>(false);

  const createItem = () => {
    props.createItem("Option" + (props.items.length + 1));
  };

  const submit = () => {
    props.submit(selectedItemId);
  };

  const clickItem = (itemId: string) => {
    setSelectedItemId(itemId);
  }

  const clickDesignView = () => {
    setIsDesignPageEditView(true);
  }

  const mouseEnter = () => {
    if (isDesignPageEditView) {
      setIsMouseInDesignEdit(true);
    }
  }

  const mouseLeave = () => {
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
        <div className="designEdit" hidden={!isDesignPageEditView} onMouseEnter={mouseEnter} onMouseLeave={mouseLeave}>
          <input className="edit-title" value={props.title} placeholder={props.title ? "" : "Untitled poll"} onChange={event => props.createOrChangeTitle(event.target.value)}></input>
          <li className="option-list">
            {props.items.map((item) => (
              <label className="item">
                <input className="radio-button" type="radio" name="option" disabled></input>
                <input className="item-text" value={item.text} onChange={event => props.changeItem(item, event.target.value)}></input>
              </label>
            ))}
            <Button onClick={createItem}> +  Add option </Button>
          </li>
        </div>
        <div className="designView" hidden={isDesignPageEditView} onClick={clickDesignView}>
          <span className="view-title">{props.title ?? "Untitled poll"}</span>
          <li className="option-list">
            {props.items.map((item) => (
              <label className="item">
                <input className="radio-button" type="radio" name="option" disabled></input>
                <span className="item-text">{item.text}</span>
              </label>
            ))}
            <Button onClick={createItem}> +  Add option </Button>
          </li>
        </div>
      </div>
      <div className="response" hidden={props.user.userType == UserType.designer}>
        <span className="view-title">{props.title ?? "Untitled poll"}</span>
        <li className="option-list">
          {props.items.map((item) => (
            <label className="item">
              <input className="radio-button" type="radio" name="option" onClick={() => clickItem(item.id)} disabled={props.getSubmitIds() && props.getSubmitIds().includes(props.user.id)}></input>
              <span className="item-text">{item.text}</span>
            </label>
          ))}
          <Button onClick={submit} disabled={props.getSubmitIds() && props.getSubmitIds().includes(props.user.id)}> Submit </Button>
        </li>
      </div>
      <div hidden={props.user.userType != UserType.designer && (!props.getSubmitIds() || !props.getSubmitIds().includes(props.user.id))}>
        <span className="result-title">Results</span>
        <div className="result">
          <li className="option-list">
            {props.items.map((item) => (
              <div>
                <p className="result-text">{item.text}</p>
                <progress value={item.count * 100 / props.getSubmitCount()} max="100">
                  <div className="progress-bar">
                    <span>65%</span>
                  </div>
                </progress>
              </div>
            ))}
            <span className="item-text">{props.getSubmitCount()} {props.getSubmitCount() > 1 ? "votes" : "vote"}</span>
          </li>
        </div>
      </div>
    </div>
  );
};
