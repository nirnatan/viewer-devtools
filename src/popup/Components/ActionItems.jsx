import React from 'react';
import { compose, lifecycle, withState } from 'recompose';
import ViewerActionItems from './ViewerActionItems';
import EditorActionItems from './EditorActionItems';

const getBackgroundPage = () => new Promise(res => chrome.runtime.getBackgroundPage(res));

const TYPES = {
  VIEWER: 'VIEWER',
  EDITOR: 'EDITOR',
  NONE: 'NONE',
};

const ActionItems = props => {
  switch (props.type) {
    case TYPES.VIEWER:
      return <ViewerActionItems {...props} />;
    case TYPES.EDITOR:
      return <EditorActionItems {...props} />;
    default:
      return <div />;
  }
};

const { object, string, func, bool } = React.PropTypes;
ActionItems.propTypes = {
  buttonStyle: object,
  settings: object.isRequired,

  // State
  type: string.isRequired,
  isMobile: bool.isRequired,

  // State Actions
  setType: func.isRequired,
  setIsMobile: func.isRequired,
};

const enhance = compose(
  withState('type', 'setType', TYPES.NONE),
  withState('isMobile', 'setIsMobile', false),
  lifecycle({
    componentWillMount() {
      getBackgroundPage().then(({ Utils }) => {
        Utils.isEditor().then(res => res && this.props.setType(TYPES.EDITOR));
        Utils.isViewer().then(res => res && this.props.setType(TYPES.VIEWER));
        Utils.isMobileView().then(this.props.setIsMobile);
      });
    },
  })
);

export default enhance(ActionItems);
