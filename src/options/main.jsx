import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';
import injectGoogleAnalytics from '../scripts/ga';
import store from '../store/store';
import Options from './Options';

injectTapEventPlugin();
injectGoogleAnalytics('/options.html');

const render = () => {
  ReactDOM.render(
    <Provider store={store}>
      <MuiThemeProvider>
        <Options />
      </MuiThemeProvider>
    </Provider>,
    document.getElementById('app')
  );
};

render();
store.subscribe(render);
