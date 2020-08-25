/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { FC, KeyboardEvent } from "react";

interface NoteEditorProps extends React.AllHTMLAttributes<HTMLTextAreaElement> {
  onEnter: () => void;
}

export const NoteEditor: FC<NoteEditorProps> = (props) => {
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.keyCode == 13 && !e.shiftKey) {
      e.preventDefault();
      props.onEnter();
    }
  };

  return (
    <div className="note editor">
      <textarea
        className="note-text"
        onKeyDown={onKeyDown}
        onChange={props.onChange}
        value={props.value}
        onFocus={props.onFocus}
      />
    </div>
  );
};
