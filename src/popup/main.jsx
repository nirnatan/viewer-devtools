import React from 'react'; // eslint-disable-line no-unused-vars
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';
import injectGoogleAnalytics from '../scripts/ga';
import store from '../store/store';
import Popup from './Popup';
import BoltPopup from './BoltPopup';
import ThunderPop from './ThunderPop';

injectTapEventPlugin();
injectGoogleAnalytics('/popup.html');

const getPopup = (useBolt, useThunderbolt) => {
  if (useThunderbolt) {
    return <ThunderPop />;
  } else if (useBolt) {
    return <BoltPopup />;
  } else {
    return <Popup />;
  }
};

const render = () => {
  const useBolt = store.getState().settings.get('useBolt');
  const useThunderbolt = store.getState().settings.get('useThunderbolt');
  ReactDOM.render(
    <Provider store={store}>
      <MuiThemeProvider>
        {getPopup(useBolt, useThunderbolt)}
      </MuiThemeProvider>
    </Provider>,
    document.getElementById('app')
  );
};

render();
store.subscribe(render);
window.store = store;
