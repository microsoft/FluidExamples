import { mergeStyles, Spinner } from "@fluentui/react";
import * as React from "react";
import { BrainstormModel, createBrainstormModel } from "../BrainstormModel";
import { Header } from "./Header";
import { NoteSpace } from "./NoteSpace";
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { FluidContainer } from "@fluid-experimental/fluid-static";
import { getCurrentUser, getHumanUsers } from "../utils/audience";

export const BrainstormView = (props: {fluid: FluidContainer}) => {
  const { fluid } = props;
  const [model] = React.useState<BrainstormModel>(createBrainstormModel(fluid));

  const [, setMembers] = React.useState(getHumanUsers(fluid))
  const authorInfo = getCurrentUser(fluid);

  React.useEffect(() => {
    const memberFn = (member: string) => {
        const client = fluid.audience.getMember(member);
        if (client && client.details) {
            setMembers(getHumanUsers(fluid));
        }
    };
    fluid.audience.on("addMember", memberFn);
    return () => {
      fluid.audience.off("addMember", memberFn);
    };
  });

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
        {...props}
        model={model}
        author={authorInfo}
      />
    <DndProvider backend={HTML5Backend}>
      <NoteSpace
        model={model}
        author={authorInfo.user}
      />
      </DndProvider>
    </div>
  );
};
