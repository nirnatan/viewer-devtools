import React from 'react';
import { connect } from 'react-redux';
import { mapProps } from 'recompose';
import { omit, capitalize } from 'lodash';
import Toggle from 'material-ui/Toggle';
import MultiSelectCard from '../../components/MultiSelectCard';
import * as actionCreators from '../../store/actions/index';

const styles = {
  packages: { padding: 20 },
  autoDebug: { marginBottom: 20 },
};

const getPackageSelector = (project, { packages, togglePackage }) => (
  <MultiSelectCard
    style={{ marginBottom: 10 }}
    title={capitalize(project)}
    subtitle={`Choose the ${project} packages you want to load in debug mode`}
    options={omit(packages[project], ['all'])}
    disableItems={packages[project].all}
    onToggleExperiment={name => togglePackage(project, name)}
  >
    <Toggle
      label={`Debug all ${project} packages`}
      labelPosition="right"
      toggled={packages[project].all}
      onToggle={() => togglePackage(project, 'all')}
    />
  </MultiSelectCard>
);

const Packages = props => (
  <div style={styles.packages}>
    <Toggle
      style={styles.autoDebug}
      label="Auto debug modified packages"
      labelPosition="right"
      toggled={props.packages.autoDebugModified}
      onToggle={() => props.toggleAutoDebugModified()}
    />
    {getPackageSelector('editor', props)}
    {getPackageSelector('viewer', props)}
  </div>
);

const { PropTypes } = React;
Packages.propTypes = {
  packages: PropTypes.shape({
    viewer: PropTypes.object.isRequired,
    editor: PropTypes.object.isRequired,
  }).isRequired,

  // Actions
  toggleAutoDebugModified: PropTypes.func.isRequired,
  togglePackage: PropTypes.func.isRequired,
};


const enhance = mapProps(props => Object.assign({}, props, { packages: props.packages.toJS() }));

export default connect(({ packages }) => ({ packages }), actionCreators)(enhance(Packages));
