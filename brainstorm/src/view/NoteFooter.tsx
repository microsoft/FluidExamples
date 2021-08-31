import React from "react";
import { Text } from "@fluentui/react";
import { FrsMember } from "@fluid-experimental/frs-client";
import { NoteData } from "../Types";

export type NoteFooterProps = { currentUser : FrsMember } & Pick<NoteData, "lastEdited">;

//deplay time in ms for waiting note content changes to be settle
const delay = 2000;

export function NoteFooter(props: NoteFooterProps) {
  const { currentUser, lastEdited } = props;
  let lastEditedMemberName;

  if(Date.now() - lastEdited.time >= delay) {
    lastEditedMemberName = currentUser?.userName === lastEdited.userName ? "you" : lastEdited.userName;
  }
  else {
    lastEditedMemberName = "...";
  }

  return (
    <div style={{ flex: 1 }}>
      <Text 
        block={true} 
        nowrap={true} 
        variant={"medium"}
        styles={{
          root: { alignSelf: "center", marginLeft: 7 },
        }}
      > 
        Last edited by {lastEditedMemberName}
      </Text>
    </div>
  );
}
