/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { createApp } from "vue";
import { diceValueKey } from "../app";

// To see this view rendered, change the import in app.js to:
// import { vueDiceRoller as diceRoller } from "./view";
export const  vueDiceRoller = (dice, elem) => {
    const app = createApp({
        template: `
        <div style="text-align: center" >
            <div v-bind:style="{ fontSize: '200px', color: diceColor }">
                {{diceCharacter}}
            </div>
            <button style="font-size: 50px;" v-on:click="rollDice">
                Roll
            </button>
        </div>`,
        data: () => ({ diceValue: dice.get(diceValueKey) }),
        computed: {
            diceCharacter() {
                return String.fromCodePoint(0x267f + (this.diceValue));
            },
            diceColor() {
                return `hsl(${this.diceValue * 60}, 70%, 50%)`;
            },
        },
        methods: {
            rollDice() {
                dice.set(diceValueKey, Math.floor(Math.random() * 6)+1);
            },
            syncLocalAndFluidState() {
                this.diceValue = dice.get(diceValueKey);
            },
        },
        mounted() {
            dice.on("valueChanged", this.syncLocalAndFluidState);            
        },
        unmounted() {
            dice.off("valueChanged", this.syncLocalAndFluidState);
        },
    });

    app.mount(elem);
}
