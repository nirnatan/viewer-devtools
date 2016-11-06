import React from 'react';
import { connect } from 'react-redux';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import Paper from 'material-ui/Paper';
import { mapValues } from 'lodash';
import { compose, mapProps, lifecycle, withState } from 'recompose';
import MultiSelectCard from '../../components/MultiSelectCard';
import { requestFeatures, getSpreadsheetURL } from '../../store/utils';
import * as actionCreators from '../../store/actions/index';

const styles = {
  spreedsheet: { width: '100%', height: 900 },
  modal: { height: '90%' },
  modalContentStyle: { width: '90%', maxWidth: 'none', height: '90%' },
};

const Features = (props) => (
  <Paper zDepth={2} style={{ marginTop: 20 }}>
    <MultiSelectCard
      title="Features"
      options={mapValues(props.features, 'active')}
      onToggleExperiment={name => props.toggleFeature(name)}
      columns={1}
      initiallyExpanded
    >
      <FlatButton label="Update" onClick={() => props.openDialog(true)} />
    </MultiSelectCard>
    <Dialog
      style={styles.modal}
      title="Features"
      modal
      open={props.dialogOpen}
      contentStyle={styles.modalContentStyle}
      actions={<FlatButton label="Close" onClick={() => props.openDialog(false)} />}
    >
      <iframe src={getSpreadsheetURL()} style={styles.spreedsheet} />
    </Dialog>
  </Paper>
);

const { PropTypes } = React;
Features.propTypes = {
  features: PropTypes.object.isRequired,

  // Actions
  toggleFeature: PropTypes.func.isRequired,

  // State
  dialogOpen: PropTypes.bool.isRequired,

  // State Action
  openDialog: PropTypes.func.isRequired,
};

const enhance = compose(
  withState('dialogOpen', 'openDialog', false),
  mapProps(props => Object.assign({}, props, { features: props.features.toJS() })),
  lifecycle({
    componentWillMount() {
      requestFeatures().then(features => this.props.updateFeatures(features));
    },
  })
);

export default connect(({ features }) => ({ features }), actionCreators)(enhance(Features));
