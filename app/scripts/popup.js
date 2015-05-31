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

var tabId;
chrome.windows.getCurrent(function (currentWindow) {
    chrome.tabs.query({active: true, windowId: currentWindow.id}, function (activeTabs) {
        tabId = activeTabs[0].id;
        //chrome.tabs.executeScript(tabId, {file: 'scripts/contentscript.js', allFrames: false});
    });
});

requirejs(['react', 'lodash', 'popup/app'], function (React, _, app) {
    var props = {
        fire: function (eventName, evtData, callback) {
            var evt = {
                name: eventName,
                data: evtData
            };

            chrome.tabs.sendMessage(tabId, evt, callback);
        }
    };
    var appElement = React.createElement(app, props);

    window.rendered = React.render(appElement, document.getElementById('root'));
});

