/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { diceValueKey } from "../app";

const template = document.createElement("template");

template.innerHTML = `
  <style>
    .wrapper { text-align: center }
    .dice { font-size: 200px }
    .roll { font-size: 50px;}
  </style>
  <div class="wrapper">
    <div class="dice"></div>
    <button class="roll"> Roll </button>
  </div>
`

class Dice extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));
    this.diceValue = shadow.querySelector(".dice");

    shadow.querySelector(".roll").onclick = () => this.onRoll(Math.floor(Math.random() * 6) + 1);
  }

  static get observedAttributes() {
    return ["value"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case "value":
        this.diceValue.textContent = String.fromCodePoint(0x267f + Number(newValue));
        this.diceValue.style.color = `hsl(${newValue * 60}, 70%, 50%)`;
        break;      
    }
  }
}

export const wcRenderView = (diceMap, elem) => {
  customElements.define("wc-dice", Dice);
  const dice = document.createElement("wc-dice");
  dice.onRoll = number => diceMap.set(diceValueKey, number);
  const updateDice = () => dice.setAttribute("value", diceMap.get(diceValueKey));
  updateDice();
  diceMap.on("valueChanged", updateDice)

  elem.append(dice);
}
