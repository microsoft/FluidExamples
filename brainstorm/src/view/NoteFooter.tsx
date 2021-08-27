import React from "react";
import { TextField } from "@fluentui/react";
import { FrsMember } from "@fluid-experimental/frs-client";
import { NoteData } from "../Types";
import { ColorOptions, DefaultColor } from "./Color";

export type NoteFooterProps = { currentUser : FrsMember, refreshView : () => void } & Pick<NoteData, "lastEdited" | "color">;



const delay = 5000;

export function NoteFooter(props: NoteFooterProps) {
  const { currentUser, refreshView, lastEdited, color = DefaultColor } = props;
  let isDirty = React.useRef<boolean | undefined>(false);
  let lastEditedMemberName;
  let dirtyTimeStamp = React.useRef<number | undefined>(lastEdited.time);
  let timeout = React.useRef<undefined | NodeJS.Timeout>(undefined);
  if (!isDirty.current && lastEdited.time !== dirtyTimeStamp.current) {
      dirtyTimeStamp.current = lastEdited.time;
      timeout.current = setTimeout(() => {
          isDirty.current = false;
          refreshView();
      }, delay);
      isDirty.current = true;
  } else if (isDirty.current && lastEdited.time !== dirtyTimeStamp.current && timeout.current !== undefined) {
      dirtyTimeStamp.current = lastEdited.time;
      clearTimeout(timeout.current);
      timeout.current = setTimeout(() => {
        isDirty.current = false;
        refreshView();
    }, delay);
  }

//   let timerIsRunning = React.useRef(false);
//   let isDirty = React.useRef(false);
//   let dirtyTimeStamp.current = React.useRef(lastEdited.time);
//   const timeout.current = settimeout.current(() => { console.log("timer ended"); }, 30000);

//   // To prevent flickering, we want to make sure no one else is editing the note for 2s
//   // Let's use timer in cache to perform the 2s count down
//   React.useMemo(() => {
//     // timer is not running, start a new timer
//     if(!timerIsRunning.current){
//         timerIsRunning.current = true;
//         isDirty.current = false;
//         settimeout.current(() => {
//             timerIsRunning.current = false;
//             // 2 seconds elapsed since dirty flag was set, clear the dirty flag
//             if(Date.now() - dirtyTimeStamp.current.current >= 2000){
//                 isDirty.current = false;
//             }
//             // trigger new timer since it hasn't been 2 seconds since dirty flag was set
//             else{
//                 dirtyTimeStamp.current.current = Date.now();
//             }
//             refreshView();
//         }, 2000);
//     }
//     // timer is running, but new edit came in, set the dirty flag
//     else{
//         isDirty.current = true;
//         dirtyTimeStamp.current.current = lastEdited.time;
//     }
//     return isDirty;
//   }, [lastEdited.time, dirtyTimeStamp.current.current]);

// React.useMemo(() => {
//     if(timeout.current.hasRef()){
//         isDirty.current = true;
//         dirtyTimeStamp.current.current = lastEdited.time;
//     }
//     else{
//         if(Date.now() - dirtyTimeStamp.current.current >= 2000){
//             isDirty.current = false;
//             refreshView();
//         }
//         else{
//             timeout.current.refresh();
//         }
//     }
// }, [lastEdited.time]);

// Function to add our give data into cache
// const addDataIntoCache = (cacheName, url, response) => {
//     // Converting our respons into Actual Response form
//     const data = new Response(JSON.stringify(response));
  
//     if ('caches' in window) {
//       // Opening given cache and putting our data into it
//       caches.open(cacheName).then((cache) => {
//         cache.put(url, data);
//         alert('Data Added into cache!')
//       });
//     }
//   };

  if(!isDirty.current) {
    lastEditedMemberName = currentUser?.userName === lastEdited.member.userName ? "you" : lastEdited.member.userName;
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
