import React from 'react';
import { connect } from 'react-redux';
import { mapProps } from 'recompose';
import { reduce } from 'lodash';
import Divider from 'material-ui/Divider';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import Toggle from 'material-ui/Toggle';
import Chips from '../../components/Chips';
import * as actionCreators from '../../store/actions/index';

const styles = {
  platform: { padding: 20 },
  useCustomApp: { marginBottom: 20 },
  customAppVersions: { marginBottom: 20, marginTop: 20 },
};

const Platform = props => {
  let appId;
  let appVersion;
  return (<div style={styles.platform}>
    <Toggle
      style={styles.useCustomApp}
      label="Use local wixCode SDK"
      labelPosition="right"
      toggled={props.platform.useLocalWixCodeSdk}
      onToggle={() => props.toggleLocalWixCodeSdk()}
    />
    <Divider style={styles.useCustomApp} />
    <Toggle
      label="Use Custom Application"
      labelPosition="right"
      toggled={props.platform.useCustomApp}
      onToggle={() => props.toggleUseCustomApp()}
    />
    <TextField
      disabled={!props.platform.useCustomApp}
      floatingLabelText="Application ID"
      defaultValue={props.platform.applicationId}
      hintText="Enter your application id"
      onBlur={evt => props.updatePlatformApplicationId(evt.target.value)}
    /><br />
    <TextField
      disabled={!props.platform.useCustomApp}
      floatingLabelText="Port"
      defaultValue={props.platform.port}
      hintText="Enter the port of your local server"
      onBlur={evt => props.updatePort(evt.target.value)}
    /><br />
    <TextField
      disabled={!props.platform.useCustomApp}
      floatingLabelText="Editor Worker"
      defaultValue={props.platform.editor}
      hintText="Enter your Editor file name"
      onBlur={evt => props.updatePlatformEditor(evt.target.value)}
    /><br />
    <TextField
      disabled={!props.platform.useCustomApp}
      floatingLabelText="Viewer Worker"
      defaultValue={props.platform.viewer}
      hintText="Enter your Viewer file name"
      onBlur={evt => props.updatePlatformViewer(evt.target.value)}
    />
    <Divider />
    <div style={styles.customAppVersions}>
      <TextField
        floatingLabelText="Application ID"
        ref={textField => { appId = appId || textField.input; }}
      />
      <TextField
        floatingLabelText="Application Version"
        ref={textField => { appVersion = appVersion || textField.input; }}
      />
      <FlatButton
        label="Apply"
        onClick={() => {
          props.addAppCustomVersion(appId.value, appVersion.value);
          appId.value = '';
          appVersion.value = '';
        }}
      />
      <Chips
        items={reduce(props.platform.appsCustomVersions, (acc, version, id) => acc.concat(`${id} : ${version}`), [])}
        onRequestDelete={app => props.removeAppCustomVersion(app.split(' : ')[0])}
      />
    </div>
  </div>);
};

const { PropTypes } = React;
Platform.propTypes = {
  platform: PropTypes.shape({
    useCustomApp: PropTypes.bool,
    applicationId: PropTypes.string,
    port: PropTypes.string,
    editor: PropTypes.string,
    viewer: PropTypes.string,
    appsCustomVersions: PropTypes.object.isRequired,
    useLocalWixCodeSdk: PropTypes.bool.isRequired,
  }),

  // Actions
  toggleUseCustomApp: PropTypes.func.isRequired,
  updatePlatformApplicationId: PropTypes.func.isRequired,
  updatePort: PropTypes.func.isRequired,
  updatePlatformEditor: PropTypes.func.isRequired,
  updatePlatformViewer: PropTypes.func.isRequired,
  toggleLocalWixCodeSdk: PropTypes.func.isRequired,
  addAppCustomVersion: PropTypes.func.isRequired,
  removeAppCustomVersion: PropTypes.func.isRequired,
};

const enhance = mapProps(props => Object.assign({}, props, { platform: props.platform.toJS() }));

export default connect(({ platform }) => ({ platform }), actionCreators)(enhance(Platform));
