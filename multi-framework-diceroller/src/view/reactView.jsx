/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import ReactDOM from "react-dom";
import { diceValueKey } from "../app";

// To see this view rendered, change the import in app.js to:
// import { reactDiceRoller as diceRoller } from "./view";
export const reactDiceRoller = (dice, elem) => {
    ReactDOM.render(<ReactView dice={dice} />, elem);
}

const ReactView = (props) => {
    const { dice } = props;
    const [diceValue, setDiceValue] = React.useState(1);

    const rollDice = () => dice.set(diceValueKey, Math.floor(Math.random() * 6)+1);

    React.useEffect(() => {
        const syncLocalAndFluidState = () => setDiceValue(dice.get(diceValueKey));
        syncLocalAndFluidState();
        dice.on("valueChanged", syncLocalAndFluidState);
        return () => {
            dice.off("valueChanged", syncLocalAndFluidState);
        };
    });
    return (
        <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 200, color: `hsl(${diceValue * 60}, 70%, 50%)` }}>
                {String.fromCodePoint(0x267F + diceValue)}
            </div>
            <button style={{ fontSize: 50 }} onClick={rollDice}>
                Roll
            </button>
        </div>
    );
};
