import Immutable from 'immutable';
import { mapValues } from 'lodash';
import { initFromStorage } from './actions/index';

export const updateStorage = store => next => action => {
  const result = next(action);
  chrome.storage.local.set({ devtools: mapValues(store.getState(), v => v.toJS()) });
  return result;
};

export const init = store => {
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
