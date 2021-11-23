import { ISharedMap, IValueChanged } from '@fluidframework/map';
import { useCallback, useEffect, useState } from 'react';
import { useFluidContext } from './use-fluid-context';

export function useFluidState<T>(
  key: string,
): [T | undefined, (v: T) => void, () => boolean] {
  const { sharedMap } = useFluidContext();

  const [value, setValue] = useState(sharedMap.get(key));

  useEffect(() => {
    function onChange(changed: IValueChanged) {
      if (changed.key === key) {
        const newValue = sharedMap.get(key);

        setValue(newValue);
      }
    }

    sharedMap.on('valueChanged', onChange);
    return () => {
      sharedMap.off('valueChanged', onChange);
    };
  }, [sharedMap, key]);

  const update = useCallback(
    (v: T) => {
      sharedMap.set(key, v);
    },
    [sharedMap, key],
  );

  const deleteKey = useCallback(() => {
    return sharedMap.delete(key);
  }, [sharedMap, key]);

  return [value, update, deleteKey];
}

function getAllValuesWithPrefix<T>(
  map: ISharedMap,
  key: string,
): Record<string, T> {
  const values: Record<string, T> = {};

  for (const [k, value] of map.entries()) {
    if (k.indexOf(key) === 0) {
      values[k] = value;
    }
  }

  return values;
}

export function useFluidStateForPrefix<T>(key: string): Record<string, T> {
  const { sharedMap } = useFluidContext();

  const [value, setValue] = useState(() => {
    return getAllValuesWithPrefix<T>(sharedMap, key);
  });

  useEffect(() => {
    function onChange(changed: IValueChanged) {
      if (changed.key.indexOf(key) == 0) {
        const newValue = getAllValuesWithPrefix<T>(sharedMap, key);
        setValue(newValue);
      }
    }

    sharedMap.on('valueChanged', onChange);
    return () => {
      sharedMap.off('valueChanged', onChange);
    };
  }, [sharedMap, key]);

  return value;
}
