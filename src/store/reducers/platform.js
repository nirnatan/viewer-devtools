import Immutable from 'immutable';

const DEFAULT_STORE = Immutable.fromJS({
  useLatestRcForViewerWorker: false,
  useLocalWixCodeSdk: false,
  useCustomApp: false,
  applicationId: '',
  port: '',
  viewer: '',
  editor: '',
  appsCustomVersions: {},
});

const addAppCustomVersion = (state, { id, version }) => {
  return state.updateIn(['appsCustomVersions'], value => value.set(id, version));
};

const removeAppCustomVersion = (state, { id }) => {
  return state.updateIn(['appsCustomVersions'], value => value.delete(id));
};

const platform = (state = DEFAULT_STORE, action) => {
  switch (action.type) {
    case 'TOGGLE_UES_LATEST_RC_FOR_VIEWER_WORKER':
      return state.updateIn(['useLatestRcForViewerWorker'], value => !value);
    case 'TOGGLE_UES_LOCAL_WIX_CODE_SDK':
      return state.updateIn(['useLocalWixCodeSdk'], value => !value);
    case 'UPDATE_PLATFORM_APPLICATION_ID':
      return state.set('applicationId', action.applicationId);
    case 'TOGGLE_UES_CUSTOM_APP':
      return state.updateIn(['useCustomApp'], value => !value);
    case 'UPDATE_PLATFORM_PORT':
      return state.updateIn(['port'], value => action.port);
    case 'UPDATE_PLATFORM_VIEWER':
      return state.updateIn(['viewer'], value => action.file);
    case 'UPDATE_PLATFORM_EDITOR':
      return state.updateIn(['editor'], value => action.file);
    case 'ADD_APP_CUSTOM_VERSION':
      return addAppCustomVersion(state, action);
    case 'REMOVE_APP_CUSTOM_VERSION':
      return removeAppCustomVersion(state, action);
    default:
      return state;
  }
};

export default platform;
