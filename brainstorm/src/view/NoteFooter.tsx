import React from "react";
import { TextField, Label } from "@fluentui/react";
import { FrsMember } from "@fluid-experimental/frs-client";
import { NoteData } from "../Types";
import { ColorOptions, DefaultColor } from "./Color";

export type NoteFooterProps = { currentUser : FrsMember } & Pick<NoteData, "lastEdited" | "color">;

//deplay time in ms for waiting note content changes to be settle
const delay = 3000;

export function NoteFooter(props: NoteFooterProps) {
  const { currentUser, lastEdited, color = DefaultColor } = props;
  let lastEditedMemberName;

  if(Date.now() - lastEdited.time >= 2000) {
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
