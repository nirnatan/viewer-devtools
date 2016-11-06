import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';
import store from '../store/store';
import Popup from './Popup';

injectTapEventPlugin();

const render = () => {
  ReactDOM.render(
    <Provider store={store}>
      <MuiThemeProvider>
        <Popup />
      </MuiThemeProvider>
    </Provider>,
    document.getElementById('app')
  );
};

render();
store.subscribe(render);
window.store = store;
