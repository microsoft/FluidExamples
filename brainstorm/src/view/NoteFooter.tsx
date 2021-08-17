import React from "react";
import { TextField } from "@fluentui/react";
import { NoteData } from "../Types";
import { ColorOptions, DefaultColor } from "./Color";

export type NoteFooterProps = Pick<NoteData, "author" | "client" | "color">;

export function NoteFooter(props: NoteFooterProps) {
  const { author, client, color = DefaultColor } = props;
  const authorName = author.userName === client?.userName? "you" : author.userName;

  return (
    <div style={{ flex: 1 }}>
      <TextField
        styles={{ fieldGroup: { background: ColorOptions[color].light}, field: { color: "grey"}}}
        borderless
        readOnly={true}
        resizable={false}
        autoAdjustHeight
        value={"Created by " + authorName}
      />
    </div>
  );
}
