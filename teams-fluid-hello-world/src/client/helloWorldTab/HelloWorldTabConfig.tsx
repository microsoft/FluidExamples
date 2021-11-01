import * as React from "react";
import { Provider, Flex, Header, Input } from "@fluentui/react-northstar";
import { useState, useEffect, useRef } from "react";
import { useTeams } from "msteams-react-base-component";
import * as microsoftTeams from "@microsoft/teams-js";
import { createContainer } from "./Util";

/**
 * Implementation of HelloWorldTab configuration page
 */
export const HelloWorldTabConfig = () => {

    const [{ inTeams, theme, context }] = useTeams({});
    const [text, setText] = useState<string>();
    const tabName = useRef("");

    const onSaveHandler = async (saveEvent: microsoftTeams.settings.SaveEvent) => {
        const host = "https://" + window.location.host;
        createContainer().then((containerId) => {
            microsoftTeams.settings.setSettings({
                contentUrl: host + "/helloWorldTab/?containerId=" + containerId + "&name={loginHint}&tenant={tid}&group={groupId}&theme={theme}",
                websiteUrl: host + "/helloWorldTab/?containerId=" + containerId + "&name={loginHint}&tenant={tid}&group={groupId}&theme={theme}",
                suggestedDisplayName: tabName.current,
                removeUrl: host + "/helloWorldTab/remove.html?theme={theme}",
                entityId: tabName.current
            });
        }).catch(error => console.log(error));
        saveEvent.notifySuccess();
    };

    useEffect(() => {
        if (context) {
            setText(context.entityId);
            tabName.current = context.entityId;
            microsoftTeams.settings.registerOnSaveHandler(onSaveHandler);
            microsoftTeams.settings.setValidityState(true);
            microsoftTeams.appInitialization.notifySuccess();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [context]);

    return (
        <Provider theme={theme}>
            <Flex fill={true}>
                <Flex.Item>
                    <div>
                        <Header content="Configure your tab" />
                        <Input
                            placeholder="Enter the tab name here"
                            fluid
                            clearable
                            value={text}
                            onChange={(e, data) => {
                                if (data) {
                                    setText(data.value);
                                    tabName.current = data.value;
                                }
                            }}
                            required />
                    </div>
                </Flex.Item>
            </Flex>
        </Provider>
    );
};
