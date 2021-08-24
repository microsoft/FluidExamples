import React from "react";
import { TextField } from "@fluentui/react";
import { FrsMember } from "@fluid-experimental/frs-client";
import { NoteData } from "../Types";
import { ColorOptions, DefaultColor } from "./Color";

export type NoteFooterProps = { currentUser : FrsMember } & Pick<NoteData,  "lastEdited" | "color">;

export function NoteFooter(props: NoteFooterProps) {
  const { currentUser, lastEdited, color = DefaultColor } = props;
  let lastEditedMemberName;

  // To prevent flickering, wait for 2s to ensure no one else is editing the note
  if((Date.now() - lastEdited.time) >= 2000) {
    lastEditedMemberName = currentUser?.userName === lastEdited.member.userName? "you" : lastEdited.member.userName;
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
        value={"Last edited by " + lastEditedMemberName}
      />
    </div>
  );
}
