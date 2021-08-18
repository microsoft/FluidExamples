import React from "react";
import { TextField } from "@fluentui/react";
import { NoteData } from "../Types";
import { ColorOptions, DefaultColor } from "./Color";

export type NoteFooterProps = Pick<NoteData, "client" | "lastEditedMember" | "color">;

export function NoteFooter(props: NoteFooterProps) {
  const { client, lastEditedMember, color = DefaultColor } = props;
  const lastEditedMemberName = client?.userName === lastEditedMember.userName? "you" : lastEditedMember.userName;

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
