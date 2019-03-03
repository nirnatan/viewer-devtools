import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';
import injectGoogleAnalytics from '../scripts/ga';
import store from '../store/store';
import Popup from './Popup';
import BoltPopup from './BoltPopup';

injectTapEventPlugin();
injectGoogleAnalytics('/popup.html');

const render = () => {
  const useBolt = store.getState().settings.get('useBolt');
  ReactDOM.render(
    <Provider store={store}>
      <MuiThemeProvider>
        {useBolt ? <BoltPopup /> : <Popup />}
      </MuiThemeProvider>
    </Provider>,
    document.getElementById('app')
  );
};

render();
store.subscribe(render);
window.store = store;
