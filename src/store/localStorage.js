import Immutable from 'immutable';
import { get, mapValues } from 'lodash';
import { initFromStorage } from './actions/index';
import { requestFeatures, requestVersions } from './utils';

export const updateStorage = store => next => action => {
  const result = next(action);
  chrome.storage.local.set({ devtools: mapValues(store.getState(), v => v.toJS()) });
  return result;
};

const updateFeatures = (store) => {
  requestFeatures().then(features => {
    const currentState = mapValues(store.getState(), v => v.toJS());
    const newFeatures = mapValues(features, (value, key) => Object.assign(value, { active: get(currentState.features, [key, 'active'], false) }));
    const devtools = Object.assign(currentState, { features: newFeatures });
    chrome.storage.local.set({ devtools });
  });
};

const updateVersions = (store) => {
  requestVersions().then(({ editor, viewer }) => {
    const devtools = mapValues(store.getState(), v => v.toJS());
    devtools.versions.editor.versions = editor.length > 0 ? editor.reverse().slice(0, 100) : devtools.versions.editor.versions;
    devtools.versions.viewer.versions = viewer.length > 0 ? viewer.reverse().slice(0, 100) : devtools.versions.viewer.versions;
    chrome.storage.local.set({ devtools });
  });
};

export const init = store => {
  updateVersions(store);
  updateFeatures(store);

  chrome.storage.local.get('devtools', ({ devtools }) => {
    if (devtools) {
      store.dispatch(initFromStorage(mapValues(devtools, v => Immutable.fromJS(v))));
    }
  });

  chrome.storage.onChanged.addListener(({ devtools: { newValue } }) => {
    if (newValue) {
      store.dispatch(initFromStorage(newValue));
    }
  });
};

export const getStoreData = () => {
  return new Promise(res => {
    chrome.storage.local.get('devtools', ({ devtools }) => {
      res(devtools);
    });
  });
};
