import { ExperimentState } from '../constants';

export const updateSettings = settings => ({
  type: 'UPDATE_SETTINGS',
  settings,
});

export const initFromStorage = data => ({
  type: 'INIT_FROM_STORAGE',
  data,
});

export const toggleExperiment = (project, experiment, state) => {
  if (!Object.values(ExperimentState).some(s => s === state)) {
    throw new Error(`Invalid experiment state: ${state}`);
  }
  return {
    type: 'TOGGLE_EXPERIMENT',
    project,
    experiment,
    state,
  };
};

export const openExperiment = experiment => ({
  type: 'OPEN_EXPERIMENT',
  experiment,
});

export const clearAllExperiments = (state, value) => ({
  type: 'CLEAR_ALL_EXPERIMENTS',
  state,
  value,
});

export const setAdditionalExperiments = (state, experiments = []) => ({
  type: 'SET_ADDITIONAL_EXPERIMENTS',
  state,
  experiments,
});

export const setAllPackages = (project, value) => ({
  type: 'SET_ALL_PACKAGES',
  project,
  value,
});

export const togglePackage = (project, packageName) => ({
  type: 'TOGGLE_PACKAGE',
  project,
  packageName,
});

export const setPackage = (project, packageName, value = true) => ({
  type: 'SET_PACKAGE',
  project,
  packageName,
  value,
});

export const updateServerPort = (port) => ({
  type: 'UPDATE_LOCAL_SERVER_PORT',
  port,
});

export const selectVersion = (project, version) => ({
  type: 'SELECT_VERSION',
  project,
  version,
});

export const updateVersions = ({ editor, viewer }) => ({
  type: 'UPDATE_VERSIONS',
  editor,
  viewer,
});

export const updateFeatures = features => ({
  type: 'UPDATE_FEATURES',
  features,
});

export const toggleFeature = feature => ({
  type: 'TOGGLE_FEATURE',
  feature,
});

export const updatePlatformApplicationId = (applicationId) => ({
  type: 'UPDATE_PLATFORM_APPLICATION_ID',
  applicationId,
});

export const updatePlatformEditor = file => ({
  type: 'UPDATE_PLATFORM_EDITOR',
  file,
});

export const updatePlatformViewer = file => ({
  type: 'UPDATE_PLATFORM_VIEWER',
  file,
});

export const updatePort = (port) => ({
  type: 'UPDATE_PLATFORM_PORT',
  port,
});

export const toggleUseCustomApp = () => ({
  type: 'TOGGLE_UES_CUSTOM_APP',
});

export const addAppCustomVersion = (id, version) => ({
  type: 'ADD_APP_CUSTOM_VERSION',
  id,
  version,
});

export const removeAppCustomVersion = (id) => ({
  type: 'REMOVE_APP_CUSTOM_VERSION',
  id,
});

export const toggleLocalWixCodeSdk = () => ({
  type: 'TOGGLE_UES_LOCAL_WIX_CODE_SDK',
});

export const toggleAutoDebugModified = () => ({
  type: 'TOGGLE_AUTO_DEBUG_MODIFIED',
});
