import Immutable from 'immutable';
import _ from 'lodash';
import { initFromStorage } from './actions/index';
import { readSpreadsheet, requestVersions, SPREADSHEETS_IDS } from './utils';

export const updateStorage = store => next => action => {
  const result = next(action);
  chrome.storage.local.set({ devtools: _.mapValues(store.getState(), v => v.toJS()) });
  return result;
};

const updateFeatures = (store) => {
  readSpreadsheet(SPREADSHEETS_IDS.FEATURES).then(features => {
    const currentState = _.mapValues(store.getState(), v => v.toJS());
    const newFeatures = _.mapValues(features, (value, key) => Object.assign(value, {
      active: _.get(currentState.features, [key, 'active'], false),
      experiments: value.experiments ? value.experiments.split(',').map(v => v.trim()) : [],
    }));
    const devtools = Object.assign(currentState, { features: newFeatures });
    chrome.storage.local.set({ devtools });
  });
};

const getLatestRc = (majorVersion, allVersions) => (
  _.maxBy(allVersions, v => {
    const ver = v.split('.');
    return ver[1] === majorVersion ? Number(ver[2]) : 0;
  })
);

const getVersions = (allVersions, releaseVersions) => {
  const versionGroups = _.groupBy(allVersions, v => v.split('.')[1]);
  return _(versionGroups)
    .keys()
    .map(Number)
    .sortBy(ver => -ver)
    .take(100)
    .concat(_.map(releaseVersions, Number))
    .sortBy(ver => -ver)
    .flatMap(v => _.reverse(versionGroups[v]))
    .value();
};

const updateVersions = (store) => {
  Promise.all([requestVersions(), readSpreadsheet(SPREADSHEETS_IDS.NAMED_VERSIONS)])
    .then(([{ editor, viewer }, namedVersions]) => {
      const devtools = _.mapValues(store.getState(), v => v.toJS());
      devtools.versions.namedVersions = _.mapValues(namedVersions, version => ({
        editor: getLatestRc(version.Editor, editor),
        viewer: getLatestRc(version.Viewer, viewer),
      }));


      devtools.versions.editor.versions = editor.length > 0 ? getVersions(editor, _.map(namedVersions, 'Editor')) : devtools.versions.editor.versions;
      devtools.versions.viewer.versions = viewer.length > 0 ? getVersions(viewer, _.map(namedVersions, 'Viewer')) : devtools.versions.viewer.versions;

      chrome.storage.local.set({ devtools });
    });
};

export const init = store => {
  updateVersions(store);
  updateFeatures(store);

  chrome.storage.local.get('devtools', ({ devtools }) => {
    if (devtools) {
      store.dispatch(initFromStorage(_.mapValues(devtools, v => Immutable.fromJS(v))));
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
