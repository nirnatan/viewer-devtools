import React from 'react';
import { connect } from 'react-redux';
import Toggle from 'material-ui/Toggle';
import RaisedButton from 'material-ui/RaisedButton';
import { lifecycle, compose, mapProps } from 'recompose';
import * as actionCreators from '../store/actions/index';

const styles = {
  popup: { display: 'flex', flexDirection: 'row', padding: 10 },
  image: {
    width: 200,
    height: 200,
  },
  buttons: { display: 'flex', flexDirection: 'column', marginTop: 15, marginBottom: 25, marginLeft: 20 },
  button: { marginTop: 10 },
  settings: { width: 30, height: 30, cursor: 'pointer' },
  useBolt: { marginRight: '10px' },
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

const BoltPopup = (props) => <div style={styles.popup}>
  <div style={styles.fixed}>
    <img
      style={styles.settings}
      src={chrome.extension.getURL('assets/images/setting.png')}
      alt="Settings"
      title="Settings"
      onClick={() => getBackgroundPage().then(({ Utils }) => Utils.openOptionsPage())}
    />
    <Toggle
      style={styles.useBolt}
      label={props.settings.useBolt ? 'Bolt': 'Santa'}
      labelPosition="left"
      toggled={props.settings.useBolt}
      onToggle={() => props.updateSettings({ useBolt: !props.settings.useBolt })}
    />

  </div>
  <img alt="bolt" src="https://static.wixstatic.com/media/cadfaa_e3cf4de25b0a4a62b56cd0c7adab1893~mv2.jpeg/v1/fill/w_200,h_200,al_c,q_80,usm_0.66_1.00_0.01/boltSanta.webp" style={styles.image} />
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

const { PropTypes } = React;
BoltPopup.propTypes = {
  settings: PropTypes.object.isRequired,
  updateSettings: PropTypes.func.isRequired,
};

const mapStateToProps = ({ settings }) => ({ settings });

const enhance = compose(
  lifecycle({
    componentWillMount() {
      document.documentElement.style.height = '200px';
    },
  }),
  mapProps(props => Object.assign(props, {
    settings: props.settings.toJS(),
  })),
);

export default connect(mapStateToProps, actionCreators)(enhance(BoltPopup));
