import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import { compose, lifecycle, withState } from 'recompose';

const getBackgroundPage = () => {
  return new Promise(res => {
    chrome.runtime.getBackgroundPage(backgroundPage => {
      res(backgroundPage);
    });
  });
};

const TYPES = {
  VIEWER: 'VIEWER',
  EDITOR: 'EDITOR',
  NONE: 'NONE',
};

const getViewerItems = (buttonStyle) => {
  return (
    <RaisedButton
      label="Open Editor"
      style={buttonStyle}
      onTouchTap={() => getBackgroundPage().then(bPage => bPage.Utils.openEditor())}
    />
  );
};

const getEditorItems = (buttonStyle) => {
  return (
    <RaisedButton
      label="Open Preview"
      style={buttonStyle}
      onTouchTap={() => getBackgroundPage().then(bPage => bPage.Utils.openEditor())}
    />
  );
};

const ActionItems = props => (
  <div>
    {props.type === TYPES.VIEWER && getViewerItems(props.buttonStyle)}
    {props.type === TYPES.EDITOR && getEditorItems(props.buttonStyle)}
  </div>
);

const { object, string, func } = React.PropTypes;
ActionItems.propTypes = {
  buttonStyle: object,
  settings: object.isRequired,

  // State
  type: string.isRequired,

  // State Actions
  setType: func.isRequired,
};

const enhance = compose(
  withState('type', 'setType', TYPES.NONE),
  lifecycle({
    componentWillMount() {
      getBackgroundPage().then(({ Utils }) => {
        Utils.isEditor().then(res => res && this.props.setType(TYPES.EDITOR));
        Utils.isViewer().then(res => res && this.props.setType(TYPES.VIEWER));
      });
    },
  })
);

export default enhance(ActionItems);
