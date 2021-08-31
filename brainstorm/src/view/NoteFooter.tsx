import React from "react";
import { TextField } from "@fluentui/react";
import { FrsMember } from "@fluid-experimental/frs-client";
import { NoteData } from "../Types";
import { ColorOptions, DefaultColor } from "./Color";

export type NoteFooterProps = { currentUser : FrsMember, refreshView : () => void } & Pick<NoteData, "lastEdited" | "color">;

//deplay time in ms for waiting note content changes to be settle
const delay = 3000;

export function NoteFooter(props: NoteFooterProps) {
  const { currentUser, refreshView, lastEdited, color = DefaultColor } = props;

  let isDirty = React.useRef<boolean>(false);
  let lastEditedMemberName;
  let dirtyTimeStamp = React.useRef<number | undefined>(lastEdited.time);
  let timeout = React.useRef<NodeJS.Timeout | undefined>(undefined);

  // if note is not dirty and a new edit came in, start the timer
  if (!isDirty.current && lastEdited.time !== dirtyTimeStamp.current) {
    // update the dirty time stamp to the new last edited time
      dirtyTimeStamp.current = lastEdited.time;
      timeout.current = setTimeout(() => {
          isDirty.current = false;
          refreshView();
      }, delay);
      // set the dirty flag so new edit coming in can restart timeout
      isDirty.current = true;
  } 
  else if (isDirty.current && lastEdited.time !== dirtyTimeStamp.current && timeout.current !== undefined) {
    // dirty flag is set, so restart a new timer
      dirtyTimeStamp.current = lastEdited.time;
      clearTimeout(timeout.current);
      timeout.current = setTimeout(() => {
        isDirty.current = false;
        refreshView();
    }, delay);
  }

  if(!isDirty.current) {
    lastEditedMemberName = currentUser?.userName === lastEdited.userName ? "you" : lastEdited.userName;
  }
  else {
    lastEditedMemberName = "...";
  }

  return (
    <div style={{ flex: 1 }}>
      <TextField
        styles={{ fieldGroup: { background: ColorOptions[color].light}, field: { color: "grey"}}}
        borderless
        readOnly={true}
        resizable={false}
        autoAdjustHeight
        value={`Last edited by ${lastEditedMemberName}`}
      />
    </div>
  );
}
