'use strict';
require(['lodash', 'dataHandler', 'utils/urlUtils'], function (_, dataHandler, urlUtils) {
    var sendToContentPage = function (request, sendResponse) {
        chrome.tabs.getSelected(null, function (tab) {
            chrome.tabs.sendMessage(tab.id, request, function () {
                if (sendResponse) {
                    sendResponse.apply(this, arguments);
                }
            });
        });
    };

    window.selectComponent = function selectComponent(id, callback) {
        var request = {
            type: 'selectComponent',
            params: id
        };
        sendToContentPage(request, callback);
    };

    window.getComponents = function getComponents(callback) {
        sendToContentPage({type: 'getComponents'}, callback);
    };

    window.markComponent = function markComponent(domId) {
        sendToContentPage({type: 'markComponent', params: domId});
    };

    window.setState = function markComponent(domId, state) {
        var params = {
            id: domId,
            state: state
        };
        sendToContentPage({type: 'setState', params: params});
    };

    var ports = [];
    chrome.runtime.onConnect.addListener(function (port) {
        if (port.name !== 'devtools') {
            return;
        }

        ports.push(port);

        // Remove port when destroyed (eg when devtools instance is closed)
        port.onDisconnect.addListener(function () {
            var i = ports.indexOf(port);
            if (i !== -1) {
                ports.splice(i, 1);
            }
        });

        port.onMessage.addListener(function (msg) {
            // Received message from devtools. Do something:
            console.log('Received message from devtools page', msg);
        });
    });

    window.inspectElement = function inspectElement(props) {
        ports.forEach(function (port) {
            port.postMessage({type: 'inspectElement', props: props});
        });
    };

    window.isDevToolsOpen = function () {
        return ports.some(function (port) {
            return port.name === 'devtools';
        });
    };

    var autoRedirect = false;
    dataHandler.autoRedirect.get()
        .then(function (result) {
            autoRedirect = result;
        });

    var experiments;
    dataHandler.getExperiments()
        .then(function (experimentsObj) {
            experiments = experimentsObj;
        });

    dataHandler.registerForChanges(function (changes) {
        autoRedirect = _.has(changes, 'autoRedirect') ? changes.autoRedirect : autoRedirect;
        experiments = _.has(changes, 'experiments') ? changes.experiments : experiments;
    });

    chrome.webRequest.onBeforeRequest.addListener(function (details) {
            var editor = /wix.*\.com/g;
            if (editor.test(details.url)) {
                return {
                    redirectUrl: applyEditorParams(details.url)

                };
            }
        },
        {
            urls: ['http://*/*']
        },
        ['blocking']);

    function applyEditorParams(url) {
        if (!autoRedirect) {
            return url;
        }

        var urlObj = urlUtils.parseUrl(url);
        urlObj.search = urlUtils.getEditorQueryString(experiments, urlObj.query);

        return urlUtils.buildFullUrl(urlObj);
    }
});
