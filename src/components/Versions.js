import React from 'react';
import { connect } from 'react-redux';
import { mapProps, compose, lifecycle } from 'recompose';
import Divider from 'material-ui/Divider';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import Subheader from 'material-ui/Subheader';
import Paper from 'material-ui/Paper';
import { requestVersions } from '../store/utils';
import * as actionCreators from '../store/actions/index';

const styles = {
  dropDown: {
    minWidth: 190,
  },
  menuItem: {
    width: 180,
  },
};

const getItems = (versions) => {
  const createMenuItem = version => (
    <MenuItem
      style={styles.menuItem}
      value={version === 'none' ? null : version}
      label={version}
      key={version}
      primaryText={version}
    />
  );

  return ['none', 'local', 'Latest RC'].map(createMenuItem)
    .concat([<Divider key="divider" />])
    .concat(versions.map(createMenuItem));
};

const Versions = (props) => {
  const onChange = project => (event, key, version) => props.selectVersion(project, version);
  const content = (
    <div>
      <Subheader style={{ display: 'inline-block', minWidth: 60, width: 'auto' }}>Editor</Subheader>
      <DropDownMenu style={styles.dropDown} value={props.editor.selected} onChange={onChange('editor')}>
        {getItems(props.editor.versions)}
      </DropDownMenu>
      <Subheader style={{ display: 'inline-block', minWidth: 60, width: 'auto' }}>Viewer</Subheader>
      <DropDownMenu style={styles.dropDown} value={props.viewer.selected} onChange={onChange('viewer')}>
        {getItems(props.viewer.versions)}
      </DropDownMenu>
    </div>
  );

  if (props.flat) {
    return content;
  }

  return (
    <Paper zDepth={2} style={{ paddingBottom: 15 }}>
      {content}
    </Paper>
  );
};

const { PropTypes } = React;
Versions.propTypes = {
  viewer: PropTypes.shape({
    versions: PropTypes.arrayOf(PropTypes.string).isRequired,
    selected: PropTypes.string,
  }),
  editor: PropTypes.shape({
    versions: PropTypes.arrayOf(PropTypes.string).isRequired,
    selected: PropTypes.string,
  }),
  flat: PropTypes.bool,

  // Actions
  selectVersion: PropTypes.func.isRequired,
};

const enhance = compose(
  mapProps(props => Object.assign({}, props, { editor: props.editor.toJS(), viewer: props.viewer.toJS() })),
  lifecycle({
    componentWillMount() {
      requestVersions()
        .then(({ editor, viewer }) => {
          this.props.updateVersions({ editor, viewer });
        });
    },
  })
);

export default connect(({ versions }, props) => {
  return Object.assign({
    editor: versions.get('editor'),
    viewer: versions.get('viewer'),
  }, props);
}, actionCreators)(enhance(Versions));
