import React from 'react';
import { v4 as uuid } from 'uuid';
import { DiceRoller } from './DiceRoller';
import { useGetDiceStore, useGetAudienceStore } from '../store';

export const DiceRollerList = () => {
  const {
    dispatch,
    actions: { editDice, createDice, deleteDice },
    queries: { getAllDice, getByValue }
  } = useGetDiceStore();

  const {queries: {getAudienceSize}} = useGetAudienceStore();


  const randomizeDice = (id: string) =>
    dispatch(
      editDice({
        id,
        props: { value: Math.floor(Math.random() * 6) + 1 },
      })
    );

  const handleClick = () => dispatch(createDice({ id: uuid(), props: { value: 1 } }));
  const handleDelete = (id: string) => dispatch(deleteDice({ id }));
  const allDice = getAllDice();

  const handleRollAll = () => {
    allDice.forEach((dice: any) => {
      randomizeDice(dice.key);
    });
  };


  const diceRollers = allDice.map((dice: any) => (
    <DiceRoller
      key={dice.key}
      id={dice.key}
      value={dice.value}
      updateValue={randomizeDice}
      onDelete={handleDelete}
    />
  ));

  const sixes = getByValue(6).map((dice: any) => (
    <DiceRoller
      key={dice.key}
      id={dice.key}
      value={dice.value}
      onDelete={handleDelete}
      updateValue={randomizeDice}
    />
  ));

  return (
    <div style={{ textAlign: 'center' }}>
      <div>Audience Size: {getAudienceSize()}</div>

      <button style={{ margin: '5vh', fontSize: 20 }} onClick={handleClick}>
        Create Dice Roller
      </button>

      <button style={{ margin: '5vh', fontSize: 20 }} onClick={handleRollAll}>
        Roll All
      </button>

      <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '5em' }}> {diceRollers} </div>
      <hr />
      <h1>Sixes</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}> {sixes} </div>
    </div>
  );
};
