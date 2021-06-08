import React from "react";
import { TextField } from "@fluentui/react";
import { NoteData } from "../Types";
import { ColorOptions, DefaultColor } from "./Color";

export type NoteBodyProps = Readonly<{
  setText(text: string): void;
}> &
  Pick<NoteData, "text" | "color">;

export function NoteBody(props: NoteBodyProps) {
  const { setText, text, color = DefaultColor } = props;

  return (
    <div style={{ flex: 1 }}>
      <TextField
        styles={{ fieldGroup: { background: ColorOptions[color].light } }}
        borderless
        multiline
        resizable={false}
        autoAdjustHeight
        onChange={(event) => setText(event.currentTarget.value)}
        value={text}
        placeholder={"Enter Text Here"}
      />
    </div>
  );
}
