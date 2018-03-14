import Immutable from 'immutable';

const DEFAULT_STORE = Immutable.fromJS({
  viewer: {
    versions: [],
    selected: null,
  },
  editor: {
    versions: [],
    selected: null,
  },
  localServerPort: '80',
  namedVersions: {},
});

const selectVersion = (state, { project, version }) => {
  return state.updateIn([project, 'selected'], () => version);
};

const selectVersions = (state, { editor, viewer }) => {
  return state.updateIn(['editor', 'selected'], () => editor).updateIn(['viewer', 'selected'], () => viewer);
};

const updateVersions = (state, { editor, viewer }) => {
  if (editor && editor.length > 0) {
    state = state.setIn(['editor', 'versions'], Immutable.fromJS(editor.reverse().slice(0, 100)));
  }
  if (viewer && viewer.length > 0) {
    state = state.setIn(['viewer', 'versions'], Immutable.fromJS(viewer.reverse().slice(0, 100)));
  }
  return state;
};

const versions = (state = DEFAULT_STORE, action) => {
  switch (action.type) {
    case 'SELECT_VERSION':
      return selectVersion(state, action);
    case 'SELECT_VERSIONS':
      return selectVersions(state, action);
    case 'UPDATE_VERSIONS':
      return updateVersions(state, action);
    case 'UPDATE_LOCAL_SERVER_PORT':
      return state.set('localServerPort', action.port);
    default:
      return state;
  }
};

export default versions;
