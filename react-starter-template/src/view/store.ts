import { TinyliciousMember } from '@fluidframework/tinylicious-client';
import { FluidModel } from '../model';
import { Node } from '../model/types';
import { useGetStore } from '../utils/hooks';

type IDiceState = Record<string, Node>;

type IDiceQueries = {
  getAllDice: () => Node[];
  getByValue: (value: number) => Node[];
};

type IDiceActions = {
  editDice: (payload: { id: string; props: { value: number } }) => void;
  createDice: (payload: { id: string; props: { value: number } }) => void;
  deleteDice: (payload: { id: string }) => void;
};

const getDiceArray = (state: IDiceState): Node[] =>
  Object.keys(state).map((key: string) => ({ key, value: state[key].value }));

const getLoadState = (model: FluidModel) => model.getAllNodes();

export const useGetDiceStore = () =>
  useGetStore<IDiceState, IDiceActions, IDiceQueries>({
    // Establish initial state on load
    initialState: (model) => getLoadState(model),

    // Specify stateful queries to use in the view
    queries: {
      getAllDice: (state) => getDiceArray(state),
      getByValue: (state, value: number) => getDiceArray(state).filter((i) => i.value === value),
    },

    // Specify actions, their payloads, and how they will interact with the model
    actions: {
      editDice: (model, payload: { id: string; props: { value: number } }) =>
        model.editNode(payload.id, payload.props),
      createDice: (model, payload: { id: string; props: { value: number } }) =>
        model.createNode(payload.id, payload.props),
      deleteDice: (model, payload: { id: string }) => model.deleteNode(payload.id),
    },

    // Sync view state with Fluid state by loading default state or patching the key that changed
    reducer: (model, draft, { type, changed }) => {
      switch (type) {
        case 'singleChange':
          draft[changed.key] = model.getNode(changed.key);
          break;
        case 'singleDelete':
          delete draft[changed.key];
          break;
        default:
          return getLoadState(model);
      }
    },
  });

type IAudienceQueries = {
  getAudienceSize: () => number;
};

export const useGetAudienceStore = () =>
  useGetStore<TinyliciousMember[], {}, IAudienceQueries>({
    initialState: (model) => model.getAudience(),
    queries: {
      getAudienceSize: (state) => state.length,
    },
    actions: {},
    reducer: (model) => {
      return model.getAudience();
    },
  });
