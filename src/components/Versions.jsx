import React from 'react';
import { map, findKey, reverse, sortBy } from 'lodash';
import { connect } from 'react-redux';
import { mapProps } from 'recompose';
import TextField from 'material-ui/TextField';
import Divider from 'material-ui/Divider';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import Subheader from 'material-ui/Subheader';
import Paper from 'material-ui/Paper';
import * as actionCreators from '../store/actions/index';

const styles = {
  dropDown: {
    minWidth: 190,
  },
  menuItem: {
    width: 180,
  },
  localPort: {
    marginLeft: 17,
    width: '84%',
  },
};

const createMenuItem = version => (
  <MenuItem
    style={styles.menuItem}
    value={version === 'none' ? null : version}
    label={version}
    key={version}
    primaryText={version}
  />
);

const getItems = (versions) => {
  return ['none', 'local', 'Latest RC'].map(createMenuItem)
    .concat([<Divider key="divider" />])
    .concat(versions.map(createMenuItem));
};

const LocalServerPort = (props) => {
  return (<TextField
    style={styles.localPort}
    floatingLabelText="Server Port"
    key={props.port || 'localServerPort'}
    defaultValue={props.port}
    hintText="Enter your server port"
    onBlur={evt => props.onChange(evt.target.value)}
  />);
};

const { PropTypes } = React;
LocalServerPort.propTypes = {
  port: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

const getName = (editor, viewer, names) => {
  return findKey(names, { editor, viewer }) || 'Custom';
};

const getNamedMenuItems = namedVersions => {
  const sortedItems = reverse(sortBy(map(namedVersions, ({ editor, viewer }, name) => ({ editor, viewer, name })), 'viewer'));
  return map(sortedItems, ({ name }) => createMenuItem(name));
};

const Versions = (props) => {
  const onChange = project => (event, key, version) => props.selectVersion(project, version);
  const onRealsedVersionChange = (event, key, version) => {
    const versions = props.namedVersions[version];
    props.selectVersions(versions.editor, versions.viewer);
  };

  const content = (
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex' }}>
        <Subheader style={{ display: 'inline-block', minWidth: 60, width: 'auto' }}>Editor</Subheader>
        <DropDownMenu style={styles.dropDown} value={props.editor.selected} onChange={onChange('editor')}>
          {getItems(props.editor.versions)}
        </DropDownMenu>
      </div>
      <div style={{ display: 'flex' }}>
        <Subheader style={{ display: 'inline-block', minWidth: 60, width: 'auto' }}>Viewer</Subheader>
        <DropDownMenu style={styles.dropDown} value={props.viewer.selected} onChange={onChange('viewer')}>
          {getItems(props.viewer.versions)}
        </DropDownMenu>
      </div>
      <div style={{ display: 'flex' }}>
        <Subheader style={{ display: 'inline-block', minWidth: 60, width: 'auto' }}>Name</Subheader>
        <DropDownMenu style={styles.dropDown} value={getName(props.editor.selected, props.viewer.selected, props.namedVersions)} onChange={onRealsedVersionChange}>
          {createMenuItem('Custom')}
          <Divider key="divider" />
          {getNamedMenuItems(props.namedVersions)}
        </DropDownMenu>
      </div>
      {!props.flat && (props.editor.selected === 'local' || props.viewer.selected === 'local') ? <LocalServerPort port={props.localServerPort} onChange={props.updateServerPort} /> : null}
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

Versions.propTypes = {
  viewer: PropTypes.shape({
    versions: PropTypes.arrayOf(PropTypes.string).isRequired,
    selected: PropTypes.string,
  }),
  editor: PropTypes.shape({
    versions: PropTypes.arrayOf(PropTypes.string).isRequired,
    selected: PropTypes.string,
  }),
  namedVersions: PropTypes.shape({
    versions: PropTypes.arrayOf(PropTypes.string).isRequired,
    selected: PropTypes.string,
  }),
  localServerPort: PropTypes.string,
  flat: PropTypes.bool,

  // Actions
  selectVersion: PropTypes.func.isRequired,
  selectVersions: PropTypes.func.isRequired,
  updateServerPort: PropTypes.func.isRequired,
};

const enhance = mapProps(props => Object.assign({}, props, { editor: props.editor.toJS(), viewer: props.viewer.toJS(), namedVersions: props.namedVersions.toJS() }));

export default connect(({ versions }, props) => {
  return Object.assign({
    editor: versions.get('editor'),
    viewer: versions.get('viewer'),
    namedVersions: versions.get('namedVersions'),
    localServerPort: versions.get('localServerPort'),
  }, props);
}, actionCreators)(enhance(Versions));
