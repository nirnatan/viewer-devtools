import React from 'react';
import { withState, compose, lifecycle } from 'recompose';

const styles = {
  impersonateImg: { height: 36, width: 36 },
  impersonate: { cursor: 'pointer' },
};

const Impersonate = props => {
  if (!props.username || props.username === props.currentUsername) {
    return <div />;
  }

  return (
    <div style={styles.impersonate}>
      <img
        style={styles.impersonateImg}
        src={chrome.extension.getURL('assets/images/impersonate.png')}
        alt="Log In"
        onClick={() => {
          chrome.runtime.getBackgroundPage(backgroundPage => {
            backgroundPage.Utils.logBackIn();
          });
        }}
      />
    </div>
  );
};

Impersonate.propTypes = {
  username: React.PropTypes.string,

  // State props
  currentUsername: React.PropTypes.string,
  setCurrentUsername: React.PropTypes.func.isRequired,
};

const enhance = compose(
  withState('currentUsername', 'setCurrentUsername', ''),
  lifecycle({
    componentWillMount() {
      chrome.runtime.getBackgroundPage(backgroundPage => {
        backgroundPage.Utils.getCurrentUsername().then(username => {
          this.props.setCurrentUsername(username);
        });
      });
    },
  })
);

export default enhance(Impersonate);
