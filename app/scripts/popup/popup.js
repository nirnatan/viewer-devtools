requirejs(['react', 'react-dom', 'lodash', 'popup/app'], function (React, ReactDOM, _, app) {
    'use strict';

    var appElement = React.createElement(app, {debuggable: true});
    window.rendered = ReactDOM.render(appElement, document.getElementById('root'));
});

