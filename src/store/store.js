import { createStore, applyMiddleware } from 'redux';
import reducers from './reducers/index';
// import { logger } from './middlewares/index';
import { init, updateStorage } from './localStorage';

const store = createStore(
  reducers,
  applyMiddleware(updateStorage)
  // applyMiddleware(logger)
);

init(store);

export default store;
