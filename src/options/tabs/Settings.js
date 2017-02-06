import React from 'react';
import { connect } from 'react-redux';
import Toggle from 'material-ui/Toggle';
import TextField from 'material-ui/TextField';
import Subheader from 'material-ui/Subheader';
import { mapProps } from 'recompose';
import * as actionCreators from '../../store/actions/index';

const styles = {
  general: { padding: 20 },
  additionalQueryParams: { width: '90%' },
  toggle: {
    marginBottom: '10px',
  },
};

const Settings = (props) => {
  return (
    <div style={styles.general}>
      <Subheader>General</Subheader>
      <TextField
        style={styles.additionalQueryParams}
        floatingLabelText="Additional Query Params"
        key={props.settings.additionalQueryParams || 'additionalQueryParams'}
        defaultValue={props.settings.additionalQueryParams}
        hintText="Enter additional query params you want to add to your url..."
        onBlur={evt => props.updateSettings({ additionalQueryParams: evt.target.value })}
      />
      <TextField
        floatingLabelText="Username"
        key={props.settings.username || 'username'}
        defaultValue={props.settings.username}
        hintText="Enter your username"
        onBlur={evt => props.updateSettings({ username: evt.target.value })}
      /><br />
      <Toggle
        style={styles.toggle}
        label="Disable NewRelic"
        labelPosition="right"
        toggled={props.settings.disableNewRelic}
        onToggle={() => props.updateSettings({ disableNewRelic: !props.settings.disableNewRelic })}
      /><br />
      <Toggle
        style={styles.toggle}
        label="Disable HTTPS"
        labelPosition="right"
        toggled={props.settings.disableHttps}
        onToggle={() => props.updateSettings({ disableHttps: !props.settings.disableHttps })}
      />
      <Subheader>Editor</Subheader>
      <Toggle
        style={styles.toggle}
        label="Disable Leave Page confirmation Popup"
        labelPosition="right"
        toggled={props.settings.disableLeavePagePopUp}
        onToggle={() => props.updateSettings({ disableLeavePagePopUp: !props.settings.disableLeavePagePopUp })}
      />
      <Toggle
        style={styles.toggle}
        label="Show open 'Preview' frame in a new window"
        labelPosition="right"
        toggled={props.settings.showPreviewButton}
        onToggle={() => props.updateSettings({ showPreviewButton: !props.settings.showPreviewButton })}
      />
      <Toggle
        style={styles.toggle}
        label="Show open 'Public' site in a new window"
        labelPosition="right"
        toggled={props.settings.showPublicButton}
        onToggle={() => props.updateSettings({ showPublicButton: !props.settings.showPublicButton })}
      />

    </div>
  );
};

const { PropTypes } = React;
Settings.propTypes = {
  settings: PropTypes.shape({
    additionalQueryParams: PropTypes.string,
    disableLeavePagePopUp: PropTypes.bool,
    disableNewRelic: PropTypes.bool,
    versionSelectorInPopup: PropTypes.bool,
    showPublicButton: PropTypes.bool,
    showPreviewButton: PropTypes.bool,
    useWixCodeRuntimeSource: PropTypes.bool,
    applyFeatureVersions: PropTypes.bool,
    username: PropTypes.string,
  }).isRequired,

  // Actions
  updateSettings: PropTypes.func.isRequired,
};

const enhance = mapProps(props => Object.assign({}, props, { settings: props.settings.toJS() }));

export default connect(({ settings }) => ({ settings }), actionCreators)(enhance(Settings));
