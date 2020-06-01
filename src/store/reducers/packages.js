import Immutable from 'immutable';
// import viewer from '../../generated/viewer';
// import editor from '../../generated/editor';
const viewer = { packages: [] };
const editor = { packages: [] };

const toObject = (array, value) => (array.reduce((acc, exp) => Object.assign(acc, { [exp]: value }), {}));

const DEFAULT_STORE = Immutable.fromJS({
  viewer: Object.assign({ all: false }, toObject(viewer.packages, false)),
  editor: Object.assign({ all: false }, toObject(editor.packages, false)),
  autoDebugModified: false,
});

const reducer = (store = DEFAULT_STORE, action) => {
  switch (action.type) {
    case 'TOGGLE_AUTO_DEBUG_MODIFIED':
      return store.updateIn(['autoDebugModified'], value => !value);
    case 'TOGGLE_PACKAGE':
      return store.updateIn([action.project, action.packageName], value => !value);
    case 'SET_PACKAGE':
      return store.setIn([action.project, action.packageName], action.value);
    default:
      return store;
  }
};

export default reducer;
