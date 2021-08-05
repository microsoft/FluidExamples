import { mergeStyles, Spinner } from "@fluentui/react";
import { FrsResources } from "@fluid-experimental/frs-client";
import * as React from "react";
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { BrainstormModel, createBrainstormModel } from "../BrainstormModel";
import { Header } from "./Header";
import { NoteSpace } from "./NoteSpace";

export const BrainstormView = (props: { frsResources: FrsResources }) => {
  const { frsResources: { fluidContainer, containerServices } } = props;
  const [model] = React.useState<BrainstormModel>(createBrainstormModel(fluidContainer));

  const audience = containerServices.audience;
  const [, setMembers] = React.useState(Array.from(audience.getMembers().values()));
  const authorInfo = audience.getMyself();

  // Setup a listener to update our users when new clients join the session
  React.useEffect(() => {
    fluidContainer.on("connected", () => setMembers(
      Array.from(
        audience.getMembers().values()
      )
    ));
    audience.on("membersChanged", () => setMembers(
      Array.from(
        audience.getMembers().values()
      )
    ));
    return () => {
      fluidContainer.off("connected", () => setMembers(
        Array.from(
          audience.getMembers().values()
        )
      ));
      audience.off("membersChanged", () => setMembers(
        Array.from(
          audience.getMembers().values()
        )
      ));
    };
  }, [fluidContainer, audience]);

  const wrapperClass = mergeStyles({
    height: "100%",
    display: "flex",
    flexDirection: "column",
  });

  if (authorInfo === undefined) {
    return <Spinner />;
  }

  return (
    <div className={wrapperClass}>
      <Header
        model={model}
        author={authorInfo}
      />
      <DndProvider backend={HTML5Backend}>
        <NoteSpace
          model={model}
          author={authorInfo}
        />
      </DndProvider>
    </div>
  );
};
