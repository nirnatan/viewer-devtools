import Immutable from 'immutable';
// import viewer from '../../generated/viewer';
// import editor from '../../generated/editor';
const viewer = { experiments: [] };
const editor = { experiments: [] };
const toObject = (array, value) => (array.reduce((acc, exp) => Object.assign(acc, { [exp]: value }), {}));

const DEFAULT_STORE = Immutable.fromJS({
  additional: {
    on: [],
    off: [],
  },
  viewer: {
    on: toObject(viewer.experiments, false),
    off: toObject(viewer.experiments, false),
  },
  editor: {
    on: toObject(editor.experiments, false),
    off: toObject(editor.experiments, false),
  },
});

const clearAllExperiments = (store, { state }) => {
  return store.setIn(['viewer', state], toObject(viewer.experiments, false))
              .setIn(['editor', state], toObject(viewer.experiments, false));
};

const toggleExperiment = (store, { project, experiment, state }) => {
  return store.updateIn([project, state, experiment], value => !value);
};

const setAdditionalExperiments = (store, { experiments = [], state }) => {
  const arr = Array.isArray(experiments) ? experiments : experiments.split(',').map(ex => ex.trim());
  return store.setIn(['additional', state], arr);
};

const openExperiment = (store, { experiment }) => {
  if (store.hasIn(['editor', 'on', experiment])) {
    store = store.setIn(['editor', 'on', experiment], true);
  }
  if (store.hasIn(['viewer', 'on', experiment])) {
    store = store.setIn(['viewer', 'on', experiment], true);
  }
  return store;
};

const reducer = (store = DEFAULT_STORE, action) => {
  switch (action.type) {
    case 'TOGGLE_EXPERIMENT':
      return toggleExperiment(store, action);
    case 'OPEN_EXPERIMENT':
      return openExperiment(store, action);
    case 'CLEAR_ALL_EXPERIMENTS':
      return clearAllExperiments(store, action);
    case 'SET_ADDITIONAL_EXPERIMENTS':
      return setAdditionalExperiments(store, action);
    default:
      return store;
  }
};

export default reducer;
