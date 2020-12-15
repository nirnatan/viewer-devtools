import React from 'react';
import { connect } from 'react-redux';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Checkbox from 'material-ui/Checkbox';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import { lifecycle, compose, mapProps } from 'recompose';
import * as actionCreators from '../store/actions/index';
import omit from 'lodash/omit';
import defaults from 'lodash/defaults'

const styles = {
  popup: { display: 'flex', flexDirection: 'row', padding: 10, fontFamily: 'Roboto, sans-serif', fontSize: '15px' },
  image: {
    width: 200,
    height: 200,
  },
  buttons: { display: 'flex', flexDirection: 'column', marginTop: 15, marginBottom: 25, marginLeft: 20, flex: 1 },
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
  label: {
    display: 'inline-block',
    lineHeight: '56px',
    overflow: 'hidden',
  },
};

const getBackgroundPage = () => {
  return new Promise(res => {
    chrome.runtime.getBackgroundPage(backgroundPage => {
      res(backgroundPage);
    });
  });
};

const onChecked = (option, thunderbolt, updateSettings) => (evt) => {
  thunderbolt = omit(thunderbolt, [option]);
  if (evt.target.checked) {
    thunderbolt[option] = 'true';
  }

  updateSettings({ thunderbolt });
};

const onSelectionChange = (option, thunderbolt, updateSettings) => (evt, index, value) => {
  thunderbolt[option] = value;
  updateSettings({ thunderbolt });
};

const applyOnClick = () => {
  getBackgroundPage().then(backgroundPage => {
    backgroundPage.Utils.applySettings('Thunderbolt');
    window.close();
  });
};

const ThunderPop = props => {
  const thunderbolt = defaults(
    omit(props.settings.thunderbolt, ["forceThunderbolt", "ssrDebug"]),
    {
      fleet: "GA",
    }
  );

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
        <label style={styles.label}>Thunderbolt Version:</label>
        <DropDownMenu value={thunderbolt.fleet} onChange={onSelectionChange('fleet', thunderbolt, props.updateSettings)}>
          <MenuItem value={''} primaryText="None" />
          <MenuItem value={'GA'} primaryText="GA" />
          <MenuItem value={'Canary'} primaryText="Latest (Canary)" />
          <MenuItem value={'ssrDebug'} primaryText="Local (ssrDebug)" />
        </DropDownMenu>
        <Checkbox label="ssrOnly" onCheck={onChecked('ssrOnly', thunderbolt, props.updateSettings)} checked={thunderbolt.ssrOnly === 'true'} />
        <Checkbox label="ssrIndicator" onCheck={onChecked('ssrIndicator', thunderbolt, props.updateSettings)} checked={thunderbolt.ssrIndicator === 'true'} />
        <Checkbox label="Exclude From SSR" onCheck={onChecked('excludeFromSsr', thunderbolt, props.updateSettings)} checked={thunderbolt.excludeFromSsr === 'true'} />
        <Checkbox label="Disable Html Embeds" onCheck={onChecked('disableHtmlEmbeds', thunderbolt, props.updateSettings)} checked={thunderbolt.disableHtmlEmbeds === 'true'} />
        {/* <RaisedButton label="SSR Debug" onClick={applyOnClick('Thunderbolt_SSR_Debug')} /> */}
        <Checkbox label="Override thunderbolt-elements" onCheck={onChecked('overrideThunderboltElements', thunderbolt, props.updateSettings)} checked={thunderbolt.overrideThunderboltElements === 'true'} />
        <TextField style={{ display: thunderbolt.overrideThunderboltElements ? '' : 'none' }} disabled={!thunderbolt.overrideThunderboltElements} placeholder="Thunderbolt Elements Version" value={thunderbolt.editorElementsOverride} onChange={evt => props.updateSettings({ thunderbolt: Object.assign(thunderbolt, { editorElementsOverride: evt.target.value }) })} />
        <Checkbox label="Disable Platform" onCheck={onChecked('disablePlatform', thunderbolt, props.updateSettings)} checked={thunderbolt.disablePlatform === 'true'} />
        <Checkbox label="Disable Platform Apps" onCheck={onChecked('shouldDisablePlatformApps', thunderbolt, props.updateSettings)} checked={thunderbolt.shouldDisablePlatformApps === 'true'} />
        <TextField style={{ display: thunderbolt.shouldDisablePlatformApps ? '' : 'none' }} disabled={!thunderbolt.shouldDisablePlatformApps} placeholder="Platform Apps to Disable" value={thunderbolt.disablePlatformApps} onChange={evt => props.updateSettings({ thunderbolt: Object.assign(thunderbolt, { disablePlatformApps: evt.target.value }) })} />
      </div>
      <div style={styles.button}>
        <RaisedButton primary label="Apply Options" onClick={applyOnClick} />
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
