/* global _ */
const pro = require('./pro');

(() => {
  const loadEditorAPI = () => {
    window.editorAPI = window.editorAPI || _.get(window, 'rendered.props.children.props.editorAPI') || _.get(window, 'testApi.editorAPI;');
  };

  const loadEditorProDebugger = () => {
    if (window.editorAPI && window.editorModel) {
      window.pro = pro.init(window);
    }
  };

  const loadAsync = (srcName, targetName, innerStuff) => {
    window.require([srcName], (required) => {
      window[targetName] = window[targetName] || required;
      _.forEach(innerStuff, prop => { window[prop] = required[prop]; });
    });
  };

  function init() {
    loadAsync('react', 'React');
    loadAsync('reactDOM', 'ReactDOM');
    loadAsync('lodash', '_');
    loadAsync('experiment', 'experiment');
    loadAsync('core', 'core', ['constants']);
    loadAsync('util', 'util', ['translate']);

    /** Add other stuff here */
  }

  let $rendered;
  Object.defineProperty(window, 'rendered', {
    get: () => $rendered,
    set: (newValue) => {
      $rendered = newValue;
      init();
      loadEditorAPI();
      loadEditorProDebugger();
    },
  });
})();
