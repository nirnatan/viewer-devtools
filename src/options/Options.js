import React from 'react';
import { Tabs, Tab } from 'material-ui/Tabs';
import Settings from './tabs/Settings';
import Experiments from './tabs/Experiments';
import Versions from '../components/Versions';
import Features from './tabs/Features';
import Platform from './tabs/Platform';
import Packages from './tabs/Packages';

const styles = {
  container: { display: 'flex' },
  leftPane: { width: 250, display: 'inline-block', paddingTop: 48, marginRight: 10 },
  rightPane: { flex: 1 },
};

const Options = props => (
  <div style={styles.container}>
    <div style={styles.leftPane}>
      <div>
        <Versions />
      </div>
      <div>
        <Features />
      </div>
    </div>
    <Tabs style={styles.rightPane}>
      <Tab label="Experiments" value="experiments"><Experiments /></Tab>
      <Tab label="Settings" value="settings"><Settings /></Tab>
      <Tab label="Platform" value="platform"><Platform /></Tab>
      <Tab label="Debug" value="debug"><Packages /></Tab>
    </Tabs>
  </div>
);

export default Options;
