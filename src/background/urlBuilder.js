import URL from 'url-parse';
import { pickBy, reduce, uniq } from 'lodash';
import { getStoreData } from '../store/localStorage';

const getDebugPackages = projectsPackages => {
  const result = Object.assign({}, projectsPackages);
  if (projectsPackages.all) {
    delete result.all;
    return Object.keys(result);
  }

  return Object.keys(pickBy(projectsPackages));
};

const applyDebug = (queryObj, { autoDebugModified, editor, viewer }) => {
  return new Promise(res => {
    if (!autoDebugModified) {
      res([]);
      return;
    }

    fetch('http://localhost/modifiedPackages')
      .then(r => r.json())
      .then(res)
      .catch(() => res([]));
  }).then(modifiedPackages => {
    if (editor.all && viewer.all) {
      return Object.assign({}, queryObj, { debug: 'all' });
    }

    const debug = modifiedPackages.concat(getDebugPackages(editor)).concat(getDebugPackages(viewer));
    if (debug.length) {
      return Object.assign({}, queryObj, { debug: debug.join(',') });
    }

    return queryObj;
  });
};

const applySettings = (queryObj, settings) => {
  const result = Object.assign({}, queryObj);
  if (settings.disableLeavePagePopUp) {
    result.leavePagePopUp = false;
  }
  if (settings.disableNewRelic) {
    result.petri_ovr = 'specs.EnableNewRelicInSanta:false;specs.DisableNewRelicScriptsSantaEditor:true';
  }
  if (settings.disableHttps) {
      const disableHttps = 'specs.HttpsAllowedForPremiumSites:false;specs.HttpsAllowedForFreeSites:false';
      result.petri_ovr = result.petri_ovr ? `${result.petri_ovr};${disableHttps}` :  disableHttps;
  }
  if (settings.useWixCodeLocalSdk) {
    result.sdkSource = 'http://localhost/wixcode-sdk/build/wix.js';
    result['js-wixcode-sdk-override'] = 'http://localhost/wixcode-sdk/build';
  }
	if (settings.disableSampleRatio) {
		result.sampleratio = 'none';
	}
  if (settings.disableHotReload) {
    result.hot = false;
  }
  if (settings.additionalQueryParams) {
    const additionalQueryParams = new URL(`//dummy?${settings.additionalQueryParams}`, true).query;
    Object.assign(result, additionalQueryParams);
  }

  return result;
};

const applyExperiments = (queryObj, experiments, features) => {
  const experimentsParams = {};
  const types = ['editor', 'viewer'];
  let openedExperiments = types.reduce((acc, type) => acc.concat(Object.keys(pickBy(experiments[type].on))), []);
  openedExperiments.push(...experiments.additional.on);
  openedExperiments = reduce(features, (acc, feature) => (feature.active ? acc.concat(feature.experiments) : acc), openedExperiments);
  if (openedExperiments.length) {
    const prevExperiments = queryObj.experiments && queryObj.experiments.split(',');
    openedExperiments.push.apply(openedExperiments, prevExperiments);
    experimentsParams.experiments = uniq(openedExperiments).join(',');
  }
  const closedExperiments = types.reduce((acc, type) => acc.concat(Object.keys(pickBy(experiments[type].off))), []);
  closedExperiments.push(...experiments.additional.off);
  if (closedExperiments.length) {
    experimentsParams.experimentsoff = uniq(closedExperiments).join(',');
  }

  return Object.assign({}, queryObj, experimentsParams);
};

const applyPlatform = (queryObj, platform, versions) => {
  const { useCustomApp, port, applicationId, editor, viewer, appsCustomVersions } = platform;
  const getLocalApp = path => (useCustomApp ? [`port:${port},path:${path},id:${applicationId}`] : []);
  const customVersions = reduce(appsCustomVersions, (acc, version, appId) => acc.concat(`${appId}:${version}`), []);

  const platformQueryParams = {};
  const editorPlatformAppSources = getLocalApp(editor).concat(customVersions).join(';');
  if (editorPlatformAppSources) {
    platformQueryParams.editorPlatformAppSources = editorPlatformAppSources;
  }
  const viewerPlatformAppSources = getLocalApp(viewer).concat(customVersions).join(';');
  if (viewerPlatformAppSources) {
    platformQueryParams.viewerPlatformAppSources = viewerPlatformAppSources;
  }
  if (versions.viewer.selected === 'local') {
    platformQueryParams.WixCodeRuntimeSource = versions.viewer.versions[0];
  }
  if (platform.useLocalWixCodeSdk) {
    platformQueryParams.sdkSource = 'http://localhost/wixcode-sdk/build/wix.js';
    platformQueryParams['js-wixcode-sdk-override'] = 'http://localhost/wixcode-sdk/build';
  }

  return Object.assign({}, queryObj, platformQueryParams);
};

const applyVersions = (queryObj, versions) => {
  const versionsParams = {};
  const {localServerPort} = versions;
  const updateVersions = (project, param) => {
    switch (versions[project].selected) {
      case null:
        break;
      case 'Latest RC':
        versionsParams[param] = versions[project].versions[0];
        break;
      case 'local':
        versionsParams[param] = `http://localhost${localServerPort && localServerPort !== '80' ? `:${localServerPort}` : ''}${project === 'editor' ? '/editor-base' : ''}`;
        break;
      default:
        versionsParams[param] = versions[project].selected;
    }
  };

  updateVersions('editor', 'EditorSource');
  updateVersions('viewer', 'ReactSource');

  return Object.assign({}, queryObj, versionsParams);
};

export default (location, option) => {
  const parsedUrl = new URL(location, true);
  return getStoreData()
    .then(store => {
      let result = Promise.resolve(parsedUrl.query);
      if (option === 'All' || option === 'Debug') {
        result = result.then(queryObj => applyDebug(queryObj, store.packages));
      }
      if (option === 'All' || option === 'Experiments') {
        result = result.then(queryObj => applyExperiments(queryObj, store.experiments, store.features));
      }
      if (option === 'All' || option === 'Platform') {
        result = result.then(queryObj => applyPlatform(queryObj, store.platform, store.versions));
      }
      if (option === 'All' || option === 'Versions') {
        result = result.then(queryObj => applyVersions(queryObj, store.versions));
      }
      if (option === 'All' || option === 'Settings') {
        if (store.settings.disableHttps) {
            parsedUrl.protocol = 'http';
        }
        result = result.then(queryObj => applySettings(queryObj, store.settings));
      }
      return result;
    })
    .then(queryObj => {
      parsedUrl.query = queryObj;
      delete parsedUrl.search;
      return parsedUrl.toString();
    });
};
