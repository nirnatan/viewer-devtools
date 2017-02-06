import Immutable from 'immutable';

const DEFAULT_SETTINGS = Immutable.fromJS({
  additionalQueryParams: '',
  disableLeavePagePopUp: true,
  disableNewRelic: true,
  disableHttps: true,
  disableSampleRatio: false,
  showPublicButton: true,
  showPreviewBtn: true,
  username: '',
});

const settings = (state = DEFAULT_SETTINGS, action) => {
  switch (action.type) {
    case 'UPDATE_SETTINGS': {
      return state.merge(action.settings);
    }
    case 'UPDATE_SETTINGS_PROPERTY': {
      const { property, value } = action;
      return state.set(property, value);
    }
    default:
      return state;
  }
};

export default settings;
