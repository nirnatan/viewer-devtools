'use strict';
requirejs.config({
    'baseUrl': 'scripts',
    'paths': {
        'jquery': '../bower_components/jquery/jquery',
        'react': '../bower_components/react/react-with-addons',
        'lodash': '../bower_components/lodash/lodash',
        'jsoneditor': '../bower_components/jsoneditor/dist/jsoneditor'
    }
});

requirejs(['react', 'lodash', 'popup/app'], function (React, _, app) {
    var appElement = React.createElement(app, {});
    window.rendered = React.render(appElement, document.getElementById('root'));
});

