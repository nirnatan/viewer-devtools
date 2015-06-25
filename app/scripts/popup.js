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

var handleRedirectChange = function (value) {
    chrome.storage.local.set({autoRedirect: value});
    window.rendered.setProps({autoRedirect: value});
};

requirejs(['react', 'lodash', 'popup/app'], function (React, _, app) {
    chrome.storage.local.get('autoRedirect', function (result) {
        var appElement = React.createElement(app, {debuggable: true, autoRedirect: !!result.autoRedirect, onRedirectChange: handleRedirectChange});
        window.rendered = React.render(appElement, document.getElementById('root'));
    });
});

