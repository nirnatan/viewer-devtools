import React from 'react';
import { connect } from 'react-redux';
import { reject, reduce, capitalize } from 'lodash';
import Divider from 'material-ui/Divider';
import TextField from 'material-ui/TextField';
import Toggle from 'material-ui/Toggle';
import { compose, withState, mapProps } from 'recompose';
import Chips from '../../components/Chips';
import MultiSelectCard from '../../components/MultiSelectCard';
import * as actionCreators from '../../store/actions/index';

const styles = {
  general: { padding: 20 },
  additional: { width: 600 },
  checkbox: {
    fontSize: '110%',
    marginBottom: '10px',
  },
  experiments: {
    columnCount: 3,
  },
};

const renderExperiments = (experiments, project, state, toggleExperiment, turnedOn) => {
  const getSubtitle = () => {
    const active = Object.values(experiments[project][state]).filter(a => a).length;
    const enabled = turnedOn ? 'enabled' : 'disabled';
    const total = Object.keys(experiments[project][state]).length;
    return `${active} experiments are ${enabled} out of ${total}`;
  };

  return (
    <MultiSelectCard
      style={{ marginBottom: 10 }}
      title={capitalize(project)}
      subtitle={getSubtitle(experiments[project][state])}
      options={experiments[project][state]}
      onToggleExperiment={name => toggleExperiment(project, name, state)}
    >
      <Chips
        items={reduce(experiments[project][state], (acc, v, k) => (v ? acc.concat(k) : acc), [])}
        onRequestDelete={name => toggleExperiment(project, name, state)}
      />
    </MultiSelectCard>
  );
};

const Experiments = (props) => {
  const state = props.turnedOn ? 'on' : 'off';
  return (
    <div style={styles.general}>
      <Toggle
        label={`Choose experiments to ${props.turnedOn ? 'enable' : 'disable'}`}
        labelPosition="right"
        toggled={props.turnedOn}
        onToggle={() => (props.turnedOn ? props.turnOff() : props.turnOn())}
      />
      <TextField
        style={styles.additional}
        floatingLabelText={`Additional Experiments to ${props.turnedOn ? 'enable' : 'disable'}`}
        hintText="Enter experiments seperated by comma"
        onKeyPress={({ key, target }) => {
          if (target.value && key === 'Enter') {
            props.setAdditionalExperiments(state, props.experiments.additional[state].concat(target.value));
            target.value = '';
          }
        }}
        onBlur={({ target }) => {
          if (target.value) {
            props.setAdditionalExperiments(state, props.experiments.additional[state].concat(target.value));
            target.value = '';
          }
        }}
      /><br />
      <Chips
        items={props.experiments.additional[state]}
        onRequestDelete={name => props.setAdditionalExperiments(state, reject(props.experiments.additional[state], v => v === name))}
      />
      <Divider />
      {renderExperiments(props.experiments, 'editor', state, props.toggleExperiment, props.turnedOn)}
      {renderExperiments(props.experiments, 'viewer', state, props.toggleExperiment, props.turnedOn)}
    </div>
  );
};

const { PropTypes } = React;
Experiments.propTypes = {
  experiments: PropTypes.shape({
    additional: PropTypes.shape({
      on: PropTypes.array.isRequired,
      off: PropTypes.array.isRequired,
    }),
    editor: PropTypes.shape({
      on: PropTypes.object.isRequired,
      off: PropTypes.object.isRequired,
    }),
    viewer: PropTypes.shape({
      on: PropTypes.object.isRequired,
      off: PropTypes.object.isRequired,
    }),
  }).isRequired,

  // Actions
  toggleExperiment: PropTypes.func.isRequired,
  clearAllExperiments: PropTypes.func.isRequired,
  setAdditionalExperiments: PropTypes.func.isRequired,

  // State
  turnedOn: PropTypes.bool.isRequired,

  // State Actions
  turnOn: PropTypes.func.isRequired,
  turnOff: PropTypes.func.isRequired,
};

const enhance = compose(
  withState('turnedOn', 'setEnabled', true),
  mapProps(props => Object.assign({}, props, {
    turnOn: () => props.setEnabled(() => true),
    turnOff: () => props.setEnabled(() => false),
    experiments: props.experiments.toJS(),
  }))
);

export default connect(({ experiments }) => ({ experiments }), actionCreators)(enhance(Experiments));
