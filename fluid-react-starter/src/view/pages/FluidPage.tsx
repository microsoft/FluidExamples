import React from 'react';
import { useParams } from 'react-router-dom';
import { FluidContext } from '../../utils';
import { DiceRollerList } from '../components/DiceRollerList';

export const FluidPage = () => {
  let { id } = useParams<{ id: string }>();
  return (
    <FluidContext id={id}>
      <DiceRollerList />
    </FluidContext>
  );
};
