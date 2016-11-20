import React from 'react';
import pure from 'recompose/pure';
import RaisedButton from 'material-ui/RaisedButton';
import MobileIcon from './MobileIcon';

const styles = {
  container: {
    display: 'flex',
    height: 36,
    justifyContent: 'center',
  },
  mobileIcon: {
    background: 'transparent',
    border: 0,
    padding: 0,
    margin: 0,
    cursor: 'pointer',
  },
  button: {
    marginRight: 0,
  },
};

const getBackgroundPage = () => new Promise(res => chrome.runtime.getBackgroundPage(res));

const ViewerActionItems = ({ buttonStyle, isMobile }) => {
  return (<div style={styles.container}>
    <RaisedButton
      label="Open Editor"
      style={Object.assign({}, buttonStyle, styles.button)}
      onTouchTap={() => getBackgroundPage().then(bPage => bPage.Utils.openEditor())}
    />
    <button
      style={styles.mobileIcon}
      onClick={() => getBackgroundPage().then(({ Utils }) => {
        Utils.setMobileView(!isMobile);
        window.close();
      })}
    >
      <MobileIcon icon={!isMobile ? 'Mobile' : 'Desktop'} />
    </button>
  </div>);
};

ViewerActionItems.propTypes = {
  buttonStyle: React.PropTypes.object,
  isMobile: React.PropTypes.bool.isRequired,
};

export default pure(ViewerActionItems);
