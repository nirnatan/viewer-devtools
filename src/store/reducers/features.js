import Immutable from 'immutable';

const DEFAULT_STORE = Immutable.fromJS({});

const updateFeatures = (state, { features }) => {
  return state.mergeDeep(features);
};

const toggleFeature = (state, { feature }) => {
  return state.updateIn([feature, 'active'], value => !value);
};

const features = (state = DEFAULT_STORE, action) => {
  switch (action.type) {
    case 'UPDATE_FEATURES':
      return updateFeatures(state, action);
    case 'TOGGLE_FEATURE':
      return toggleFeature(state, action);
    default:
      return state;
  }
};

export default features;
