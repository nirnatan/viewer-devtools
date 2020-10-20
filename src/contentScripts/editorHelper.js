/* global _ */
import pro from './pro';

(() => {
  const loadEditorAPI = () => {
    window.editorAPI = window.editorAPI || _.get(window, 'rendered.props.children.props.children.props.children.props.editorAPI') || _.get(window, 'testApi.editorAPI;');
  };

  const loadEditorProDebugger = () => {
    if (window.editorAPI && window.editorModel) {
      window.pro = pro.init(window);
    }
  };

  let $rendered;
  Object.defineProperty(window, 'rendered', {
    get: () => $rendered,
    set: (newValue) => {
      $rendered = newValue;
      loadEditorAPI();
      loadEditorProDebugger();
    },
  });
})();
