requirejs(['react', 'lodash', 'popup/app'], function (React, _, app) {
    'use strict';

    var appElement = React.createElement(app, {debuggable: true});
    window.rendered = React.render(appElement, document.getElementById('root'));
});

