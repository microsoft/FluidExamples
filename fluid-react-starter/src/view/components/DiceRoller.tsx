import React from 'react';
interface IDiceRollerProps {
  id: string;
  value: number;
  updateValue: (id: string) => void;
  onDelete: (id: string) => void;
}

export const DiceRoller = (props: IDiceRollerProps) => {
  const { id, updateValue, onDelete, value } = props;

  const diceCharacter = value ? String.fromCodePoint(0x267f + value) : 0x267f + 1 ;
  const rollDice = () => updateValue(id);
  const deleteDice = () => onDelete(id);

  return (
    <div>
      <div
        style={{
          fontSize: 200,
          lineHeight: 1,
          color: `hsl(${value * 60}, 70%, 50%)`,
        }}
      >
        {diceCharacter}
      </div>
      <button style={{ fontSize: 20 }} onClick={rollDice}>
        Roll 
      </button>
      <button style={{ fontSize: 20 }} onClick={deleteDice}>
        Delete 
      </button>
      <div style={{fontSize: 12}}>id: {id.split('-')[0]}</div>
    </div>
  );
};
