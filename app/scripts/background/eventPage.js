'use strict';
(function () {
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
}());