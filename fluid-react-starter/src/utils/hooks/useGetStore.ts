import React from 'react';
import { FluidModel, EventPayload } from '../../model';
import { useModel } from './';
import { Draft } from "immer";
import { useImmerReducer, Reducer } from "use-immer";

interface UseGetStoreProps<
  S,
  A extends { [id: string]: (payload: any) => void },
  Q extends { [id: string]: (...args: any) => any }
  > {
  initialState: (model: FluidModel) => S;
  actions: {
    [Property in keyof A]: (model: FluidModel, payload: Parameters<A[Property]>[0]) => void;
  };
  queries: {
    [Property in keyof Q]: (
      state: S,
      ...params: Parameters<Q[Property]>
    ) => ReturnType<ReturnType<Q[Property]>>;
  };
  reducer: (model: FluidModel, draft: Draft<S>, payload: EventPayload) => void;
}

interface UseGetStoreReturn<A, Q> {
  dispatch: (payload: any) => void;
  actions: A;
  queries: Q;
}

export function useGetStore<
  S,
  A extends { [id: string]: (payload: any) => void },
  Q extends { [id: string]: (...args: any) => any }
>(props: UseGetStoreProps<S, A, Q>): UseGetStoreReturn<A, Q> {
  const model = useModel();

  const reducer: Reducer<S, any> = (draft, op) => props.reducer(model, draft, op);

  const [state, dispatchState] = useImmerReducer(
    reducer,
    props.initialState(model)
  );

  React.useEffect(() => {
    const callItemDispatch = (payload: any) => {
      dispatchState(payload);
    };

    model.on('modelChanged', callItemDispatch);
    return () => {
      model.off('modelChanged', callItemDispatch);
    };
  });

  const dispatch = (payload: any) => {
    const userAction = props.actions[payload.type];

    if (userAction !== undefined) {
      userAction(model, payload);
    }
  };

  const actions = {} as any;

  for (const i in props.actions) {
    actions[i] = (payload: any) => ({
      type: i,
      ...payload,
    });
  }

  const queries = {} as any;

  for (const j in props.queries) {
    queries[j] = (...payload: any) => props.queries[j](state, ...payload);
  }

  return { dispatch, actions, queries };
}
