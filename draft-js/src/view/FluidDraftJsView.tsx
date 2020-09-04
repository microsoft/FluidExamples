/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import { ISequencedDocumentMessage } from "@fluidframework/protocol-definitions";

import { IFluidDraftJsObject } from "../fluid-object";
import { MemberList } from "./MemberList";
import { FluidEditor } from "./FluidEditor";
import { FluidContext } from "../utils";

/**
 * The entirety of the View logic is encapsulated within the App.
 * The App uses the provided model to interact with Fluid.
 */
export const FluidDraftJsView: React.FC = () => {
    const model = React.useContext(FluidContext);
    const [members, setMembers] = React.useState<IFluidDraftJsObject["members"]>(model.members);

    React.useEffect(() => {
        const onMembersChange = () => {
            setMembers(model.members);
        };
        model.on("addMember", onMembersChange);
        model.on("removeMember", onMembersChange);
        return () => {
            // When the view dismounts remove the listener to avoid memory leaks
            model.off("addMember", onMembersChange);
            model.off("removeMember", onMembersChange);
        };
    }, [model]);

    const onNewAuthor = (callback: (op: ISequencedDocumentMessage, isLocal) => void) => {
        const func = (op: ISequencedDocumentMessage, isLocal: boolean) => callback(op, isLocal);
        model.authors.on("op", func);
    };

    return (
        <div style={{ margin: "20px auto", maxWidth: 800 }}>
            <MemberList members={members} onNewAuthor={onNewAuthor} style={{ textAlign: "right" }} />
            <FluidEditor
                sharedString={model.text}
                authors={model.authors}
                presenceManager={model.presenceManager}
            />
        </div>
    );
};
