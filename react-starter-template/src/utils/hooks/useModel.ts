import { useContext } from 'react';
import { ModelContext } from '../context/context';

// Used by FluidContext, useDispatch and useSelector
export const useModel = () => useContext(ModelContext);
