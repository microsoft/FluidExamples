import React from 'react';
import { useHistory } from 'react-router-dom';
import { createFluidFile } from '../../utils';

export const Home = () => {
  const history = useHistory();
  const handleClick = async () => {
    const filePath = await createFluidFile();
    history.push(filePath);
  };

  return (
    <div>
      <h1>Home Page</h1>
      <button onClick={handleClick}>Create</button>
    </div>
  );
};
