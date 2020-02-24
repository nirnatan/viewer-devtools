import React from 'react';
import { connect } from 'react-redux';
import Toggle from 'material-ui/Toggle';
import RaisedButton from 'material-ui/RaisedButton';
import Checkbox from 'material-ui/Checkbox';
import { lifecycle, compose, mapProps } from 'recompose';
import * as actionCreators from '../store/actions/index';
import omit from 'lodash/omit';

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

const onChecked = (option, settings, updateSettings) => (evt) => {
  const thunderbolt = omit(settings.thunderbolt, [option]);
  thunderbolt.forceThunderbolt = 'true';
  if (evt.target.checked) {
    thunderbolt[option] = 'true';
  }

  updateSettings({ thunderbolt });
};

const applyOnClick = () => {
  getBackgroundPage().then(backgroundPage => {
    backgroundPage.Utils.applySettings('Thunderbolt');
    window.close();
  });
};

const ThunderPop = props => {
  const thunderbolt = props.settings.thunderbolt || {};
  return (<div style={styles.popup}>
    <div style={styles.fixed}>
      <img
        style={styles.settings}
        src={chrome.extension.getURL('assets/images/setting.png')}
        alt="Settings"
        title="Settings"
        onClick={() => getBackgroundPage().then(({ Utils }) => Utils.openOptionsPage())}
      />
    </div>
    <img alt="bolt" src="https://gifimage.net/wp-content/uploads/2017/10/monkey-cymbals-gif-1.gif" style={styles.image} />
    <div style={styles.buttons}>
      <div style={styles.button}>
        <Checkbox label="ssrDebug" onCheck={onChecked('ssrDebug', props.settings, props.updateSettings)} checked={thunderbolt.ssrDebug === 'true'} />
        <Checkbox label="ssrOnly" onCheck={onChecked('ssrOnly', props.settings, props.updateSettings)} checked={thunderbolt.ssrOnly === 'true'} />
        {/* <RaisedButton label="SSR Debug" onClick={applyOnClick('Thunderbolt_SSR_Debug')} /> */}
      </div>
      <div style={styles.button}>
        <RaisedButton primary label="Force Thunderbolt" onClick={applyOnClick} />
      </div>
    </div>
  </div>
  );
};

const { PropTypes } = React;
ThunderPop.propTypes = {
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

export default connect(mapStateToProps, actionCreators)(enhance(ThunderPop));
