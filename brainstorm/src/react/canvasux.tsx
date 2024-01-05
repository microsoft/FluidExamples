import React, { useEffect, useState } from 'react';
import { App, Note, Group } from '../schema/app_schema';
import { Session } from '../schema/session_schema';
import {
    ConnectionState,
    IFluidContainer,
    IMember,
    IServiceAudience,
    Tree,
    TreeView,
} from 'fluid-framework';
import { GroupView } from './groupux';
import { RootNoteWrapper } from './noteux';
import {
    Floater,
    NewGroupButton,
    NewNoteButton,
    DeleteNotesButton,
    ButtonGroup,
} from './buttonux';
import { undefinedUserId } from '../utils/utils';

export function Canvas(props: {
    appTree: TreeView<App>;
    sessionTree: TreeView<Session>;
    audience: IServiceAudience<IMember>;
    container: IFluidContainer;
    fluidMembers: string[];
    currentUser: string;
    setCurrentUser: (arg: string) => void;
    setConnectionState: (arg: string) => void;
    setSaved: (arg: boolean) => void;
    setFluidMembers: (arg: string[]) => void;
}): JSX.Element {
    const [invalidations, setInvalidations] = useState(0);

    const appRoot = props.appTree.root;
    const sessionRoot = props.sessionTree.root;

    // Register for tree deltas when the component mounts.
    // Any time the tree changes, the app will update
    // For more complex apps, this code can be included
    // on lower level components.
    useEffect(() => {
        const unsubscribe = Tree.on(appRoot, 'afterChange', () => {
            setInvalidations(invalidations + Math.random());
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        const updateConnectionState = () => {
            if (props.container.connectionState === ConnectionState.Connected) {
                props.setConnectionState('connected');
            } else if (
                props.container.connectionState === ConnectionState.Disconnected
            ) {
                props.setConnectionState('disconnected');
            } else if (
                props.container.connectionState ===
                ConnectionState.EstablishingConnection
            ) {
                props.setConnectionState('connecting');
            } else if (
                props.container.connectionState === ConnectionState.CatchingUp
            ) {
                props.setConnectionState('catching up');
            }
        };
        updateConnectionState();
        props.setSaved(!props.container.isDirty);
        props.container.on('connected', updateConnectionState);
        props.container.on('disconnected', updateConnectionState);
        props.container.on('dirty', () => props.setSaved(false));
        props.container.on('saved', () => props.setSaved(true));
        props.container.on('disposed', updateConnectionState);
    }, []);

    const updateMembers = () => {
        if (props.audience.getMyself() == undefined) return;
        if (props.audience.getMyself()?.userId == undefined) return;
        if (props.audience.getMembers() == undefined) return;
        if (props.container.connectionState !== ConnectionState.Connected) return;
        if (props.currentUser == undefinedUserId) {
            const user = props.audience.getMyself()?.userId;
            if (typeof user === 'string') {
                props.setCurrentUser(user);
            }
        }
        props.setFluidMembers(Array.from(props.audience.getMembers().keys()));
    };

    useEffect(() => {
        props.audience.on('membersChanged', updateMembers);
        return () => {
            props.audience.off('membersChanged', updateMembers);
        };
    }, []);

    return (
        <div className="relative flex grow-0 h-full w-full bg-transparent">
            <RootItems
                app={appRoot}
                clientId={props.currentUser}
                session={sessionRoot}
                fluidMembers={props.fluidMembers}
            />
            <Floater>
                <ButtonGroup>
                    <NewGroupButton
                        root={appRoot}
                        session={sessionRoot}
                        clientId={props.currentUser}
                    />
                    <NewNoteButton root={appRoot} clientId={props.currentUser} />
                    <DeleteNotesButton
                        session={sessionRoot}
                        app={appRoot}
                        clientId={props.currentUser}
                    />
                </ButtonGroup>
            </Floater>
        </div>
    );
}

function RootItems(props: {
    app: App;
    clientId: string;
    session: Session;
    fluidMembers: string[];
}): JSX.Element {
    const pilesArray = [];
    for (const i of props.app.items) {
        if (i instanceof Group) {
            pilesArray.push(
                <GroupView
                    key={i.id}
                    group={i}
                    clientId={props.clientId}
                    app={props.app}
                    session={props.session}
                    fluidMembers={props.fluidMembers}
                />
            );
        } else if (i instanceof Note) {
            pilesArray.push(
                <RootNoteWrapper
                    key={i.id}
                    note={i}
                    clientId={props.clientId}
                    notes={props.app.items}
                    session={props.session}
                    fluidMembers={props.fluidMembers}
                />
            );
        }
    }

    return (
        <div className="flex grow-0 flex-row h-full w-full flex-wrap gap-4 p-4 content-start overflow-y-scroll">
            {pilesArray}
            <div className="flex w-full h-24"></div>
        </div>
    );
}
