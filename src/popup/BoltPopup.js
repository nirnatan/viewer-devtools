import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import { lifecycle } from 'recompose';

const styles = {
  popup: { display: 'flex', flexDirection: 'row', padding: 10 },
  image: {
    width: 200,
    height: 200,
  },
  buttons: { display: 'flex', flexDirection: 'column', marginTop: 15, marginBottom: 25, marginLeft: 20 },
  button: { marginTop: 10 },
  settings: { width: 30, height: 30, cursor: 'pointer' },
  fixed: {
    position: 'fixed',
    right: 20,
    top: 20,
    width: 80,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
};

const getBackgroundPage = () => {
  return new Promise(res => {
    chrome.runtime.getBackgroundPage(backgroundPage => {
      res(backgroundPage);
    });
  });
};

const applyOnClick = option => () => {
  getBackgroundPage().then(backgroundPage => {
    backgroundPage.Utils.applySettings(option);
    window.close();
  });
};

const enhance = lifecycle({
  componentWillMount() {
    document.documentElement.style.height = '200px';
  },
});

const BoltPopup = () => <div style={styles.popup}>
  <div style={styles.fixed}>
    <img
      style={styles.settings}
      src={chrome.extension.getURL('assets/images/setting.png')}
      alt="Settings"
      title="Settings"
      onClick={() => getBackgroundPage().then(({ Utils }) => Utils.openOptionsPage())}
    />
  </div>
  <img alt="bolt" src="https://web.whatsapp.com/pp?e=https%3A%2F%2Fpps.whatsapp.net%2Fv%2Ft61.11540-24%2F51974803_1280718338745565_5141758748817096704_n.jpg%3Foe%3D5C7FD0B0%26oh%3D8c53599567961f26826784037312ee6a&t=l&u=972524887202-1541434223%40g.us&i=1550490263" style={styles.image} />
  <div style={styles.buttons}>
    <div style={styles.button}>
      <RaisedButton label="SSR Debug" onClick={applyOnClick('Bolt_SSR_Debug')} />
    </div>
    <div style={styles.button}>
      <RaisedButton label="Client Debug" onClick={applyOnClick('Bolt_Client_Debug')} />
    </div>
    <div style={styles.button}>
      <RaisedButton label="Force Santa" onClick={applyOnClick('Bolt_Force_Santa')} />
    </div>
  </div>
</div>;

export default enhance(BoltPopup);
