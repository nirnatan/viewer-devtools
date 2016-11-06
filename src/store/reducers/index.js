import { combineReducers } from 'redux';
import Immutable from 'immutable';
import { mapValues } from 'lodash';
import settings from './settings';
import experiments from './experiments';
import packages from './packages';
import versions from './versions';
import features from './features';
import platform from './platform';

const combinedReducers = combineReducers({
  settings,
  experiments,
  packages,
  versions,
  features,
  platform,
});

const reducers = (state, action) => {
  if (action.type === 'INIT_FROM_STORAGE') {
    return Object.assign({}, mapValues(action.data, v => Immutable.fromJS(v)));
  }

  return combinedReducers(state, action);
};

export default reducers;
