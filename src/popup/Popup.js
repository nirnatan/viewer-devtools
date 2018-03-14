import React from 'react';
import { connect } from 'react-redux';
import { sortBy, get } from 'lodash';
import { withState, mapProps, compose, lifecycle } from 'recompose';
import Divider from 'material-ui/Divider';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import Subheader from 'material-ui/Subheader';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import AutoCompleteWithAction from '../components/AutoCompleteWithAction';
import ButtonWithPopup from '../components/ButtonWithPopup';
import Versions from '../components/Versions';
import * as actionCreators from '../store/actions/index';
import Impersonate from './Components/Impersonate';
import ActionItems from './Components/ActionItems';

const getBackgroundPage = () => {
  return new Promise(res => {
    chrome.runtime.getBackgroundPage(backgroundPage => {
      res(backgroundPage);
    });
  });
};

const applyOptions = {
  ALL: 'All',
  EXPERIMENTS: 'Experiments',
  VERSIONS: 'Versions',
  DEBUG: 'Debug',
  SETTINGS: 'Settings',
  PLATFORM: 'Platform',
};

const applySettings = option => () => {
  getBackgroundPage()
    .then(backgroundPage => {
      backgroundPage.Utils.applySettings(option);
      window.close();
    });
};

const styles = {
  popup: { padding: 10 },
  divider: { marginTop: 10, marginBottom: 10 },
  impersonateImg: { height: 36, width: 36 },
  impersonate: { padding: 10, paddingBottom: 0, cursor: 'pointer', display: 'inline-block' },
  debug: { display: 'flex', alignItems: 'center' },
  debugAll: { height: 36, marginLeft: 20, fontSize: 'smaller' },
  debugAllText: { lineHeight: 'inherit' },
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
  buttons: { display: 'flex', flexDirection: 'row', marginTop: 15, marginBottom: 25 },
  button: { marginRight: 10 },
  currentVersion: { fontWeight: 'bold', color: '#000' },
};

const getPackages = packages => {
  const getPackageItem = (project, pkg) => ({
    text: pkg,
    value: (
      <MenuItem
        style={{ margin: 10 }}
        primaryText={pkg}
        secondaryText={project}
      />
    ),
  });

  const allPackages = ['viewer', 'editor']
          .reduce((acc, project) => {
            return acc.concat(Object.keys(packages[project])
                    .filter(pkg => pkg !== 'all' && !packages[project][pkg])
                    .map(pkg => getPackageItem(project, pkg)));
          }, []);

  return sortBy(allPackages, 'text');
};

const getExperiments = experiments => {
  return []
    .concat(Object.keys(experiments.editor.on).filter(exp => !experiments.editor.on[exp]))
    .concat(Object.keys(experiments.viewer.on).filter(exp => !experiments.viewer.on[exp]))
    .sort();
};

const addPackage = (packageToAdd) => {
  const [pkg, project] = packageToAdd.split('_');
  getBackgroundPage().then(({ Utils }) => {
    Utils.debugPackage(project, pkg);
    window.close();
  });
};

const debugAll = () => getBackgroundPage().then(({ Utils }) => {
  Utils.debugAll();
  window.close();
});

const CurrentVersions = ({ santa, editor }) => {
  if (!santa && !editor) {
    return null;
  }

  return (
    <div>
      <h3>Current Versions</h3>
      {santa && <Subheader>Current Santa Version: <span style={styles.currentVersion}>{santa}</span></Subheader>}
      {editor && <Subheader>Current Editor Version: <span style={styles.currentVersion}>{editor}</span></Subheader>}
      <Divider style={styles.divider} />
    </div>
  );
};

CurrentVersions.propTypes = {
  santa: React.PropTypes.string,
  editor: React.PropTypes.string,
};

const Popup = (props) => {
  return (
    <div style={styles.popup}>
      <div style={styles.fixed}>
        <img
          style={styles.settings}
          src={chrome.extension.getURL('assets/images/setting.png')}
          alt="Settings"
          title="Settings"
          onClick={() => getBackgroundPage().then(({ Utils }) => Utils.openOptionsPage())}
        />
        <Impersonate username={props.settings.username} />
      </div>
      <h3>Change Version</h3>
      <Versions flat />
      <div style={styles.buttons}>
        <ButtonWithPopup label="Apply" onClick={applySettings(applyOptions.ALL)} style={styles.button}>
          <Menu>
            <MenuItem primaryText="Apply All" onTouchTap={applySettings(applyOptions.ALL)} />
            <MenuItem primaryText="Apply Experiments" onTouchTap={applySettings(applyOptions.EXPERIMENTS)} />
            <MenuItem primaryText="Apply Versions" onTouchTap={applySettings(applyOptions.VERSIONS)} />
            <MenuItem primaryText="Apply Debug" onTouchTap={applySettings(applyOptions.DEBUG)} />
            <MenuItem primaryText="Apply Platform" onTouchTap={applySettings(applyOptions.PLATFORM)} />
            <MenuItem primaryText="Apply Settings" onTouchTap={applySettings(applyOptions.SETTINGS)} />
          </Menu>
        </ButtonWithPopup>
        <ActionItems buttonStyle={styles.button} settings={props.settings} />
      </div>
      <Divider style={styles.divider} />
      {props.settings.showCurrentVersions && <CurrentVersions santa={get(props.currentVersions, 'santa')} editor={get(props.currentVersions, 'editor')} />}
      <h3>Quick Actions</h3>
      <div style={styles.debug}>
        <AutoCompleteWithAction
          floatingLabelText="Add Package to debug"
          dataSource={getPackages(props.packages)}
          onNewRequest={pkg => props.setSelectedPackage(`${pkg.value.props.primaryText}_${pkg.value.props.secondaryText}`)}
          onActionClicked={() => addPackage(props.package)}
        />
        <FloatingActionButton mini onClick={debugAll} style={styles.debugAll}>
          <span style={styles.debugAllText}>Debug All</span>
        </FloatingActionButton>
      </div>
      <AutoCompleteWithAction
        floatingLabelText="Add Experiment"
        dataSource={getExperiments(props.experiments)}
        onNewRequest={exp => props.setSelectedExperiment(exp)}
        onActionClicked={() => getBackgroundPage().then(({ Utils }) => {
          Utils.addExperiment(props.experiment);
          window.close();
        })}
      />
    </div>
  );
};

const { PropTypes } = React;
Popup.propTypes = {
  experiments: PropTypes.object.isRequired,
  packages: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired,
  updateSettings: PropTypes.func.isRequired,
  currentVersions: PropTypes.object,

  // Actions
  setPackage: PropTypes.func.isRequired,

  // State
  experiment: PropTypes.string.isRequired,
  package: PropTypes.string.isRequired,

  // State Actions
  setSelectedExperiment: PropTypes.func.isRequired,
  setSelectedPackage: PropTypes.func.isRequired,
};

const mapStateToProps = ({ settings, packages, experiments }) => ({ settings, packages, experiments });

const enhance = compose(
  withState('experiment', 'setSelectedExperiment', ''),
  withState('package', 'setSelectedPackage', ''),
  mapProps(props => Object.assign(props, {
    settings: props.settings.toJS(),
    packages: props.packages.toJS(),
    experiments: props.experiments.toJS(),
  })),
  lifecycle({
    componentWillMount() {
      getBackgroundPage().then(({ Utils }) => {
        Utils.getCurrentVersions().then(currentVersions => {
          this.setState({ currentVersions });
        });
      });
    },
  })
);

export default connect(mapStateToProps, actionCreators)(enhance(Popup));
