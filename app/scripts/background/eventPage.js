require(['lodash', 'dataHandler', 'utils/urlUtils'], function (_, dataHandler, urlUtils) {
    'use strict';

    var ports = [];
    var tabId, currentUrl;

    chrome.tabs.onActiveChanged.addListener(function (id) {
        chrome.tabs.get(id, function (tab) {
            if (tab.url.indexOf('chrome-devtools') !== 0) {
                currentUrl = tab.url;
                tabId = id;
            }
        });
    });

    chrome.tabs.onUpdated.addListener(function (id, changeInfo, tab) {
        if (tabId === id) {
            currentUrl = changeInfo.url || tab.url;
        }
    });

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

    function getMetaElements(metaElementsCallback) {
        function getMetaElementsByTag(mapper) {
            return [].map.call(document.getElementsByTagName('meta'), mapper);
        }

        function getContentOfElements(element) {
            return {
                httpEquiv: element.getAttribute('http-equiv'),
                content: element.getAttribute('content')
            };
        }

        var code = '(function() {' +
            getMetaElementsByTag.toString() + '\n' +
            getContentOfElements.toString() + '\n' +
            'return getMetaElementsByTag(getContentOfElements);' +
            '})();';

        chrome.tabs.executeScript(tabId, {code: code}, function (metaElementsResult) {
            metaElementsCallback(metaElementsResult[0]);
        });
    }

    function sendToContentPage(request, sendResponse) {
        chrome.tabs.sendMessage(tabId, request, function () {
            if (sendResponse) {
                sendResponse.apply(this, arguments);
            }
        });
    }

    function applyEditorParams(url) {
        var urlObj = urlUtils.parseUrl(url);
        urlObj.search = urlUtils.getEditorQueryString(dataHandler, urlObj);

        return urlUtils.buildFullUrl(urlObj);
    }

    var utils = {
        selectComponent: function (id, callback) {
            var request = {
                type: 'selectComponent',
                params: id
            };
            sendToContentPage(request, callback);
        },

        getComponents: function (callback) {
            sendToContentPage({type: 'getComponents'}, callback);
        },

        startDebug: function () {
            chrome.tabs.update(tabId, {url: applyEditorParams(currentUrl)});
        },

        markComponent: function (domId) {
            sendToContentPage({type: 'markComponent', params: domId});
        },

        setState: function (domId, state) {
            var params = {
                id: domId,
                state: state
            };
            sendToContentPage({type: 'setState', params: params});
        },

        inspectElement: function (props) {
            ports.forEach(function (port) {
                port.postMessage({type: 'inspectElement', props: props});
            });
        },

        isDevToolsOpen: function () {
            return ports.some(function (port) {
                return port.name === 'devtools';
            });
        },

        isActive: function () {
            return urlUtils.hasParam(currentUrl, 'debug', 'react') || urlUtils.hasParam(currentUrl, 'debug', 'all');
        },

        isOptionsSet: function () {
            return currentUrl === applyEditorParams(currentUrl);
        },

        isViewer: function (callback) {
            var metaElementsCallback = function (metaElements) {
                var hasViewerMetaTag = metaElements.reduce(function (acc, element) {
                    return acc || element.httpEquiv === 'X-Wix-Renderer-Server';
                }, false);
                callback(hasViewerMetaTag);
            };

            getMetaElements(metaElementsCallback);
        },

        isEditor: function (callback) {
            var metaElementsCallback = function (metaElements) {
                var hasEditorMetaTag = metaElements.reduce(function (acc, element) {
                    return acc || element.httpEquiv === 'X-Wix-Editor-Server';
                }, false);

                callback(hasEditorMetaTag);
            };

            getMetaElements(metaElementsCallback);
        },

        openEditor: function () {
            getMetaElements(function (metaElements) {
                var metaSiteId, siteId;
                metaElements.forEach(function (element) {
                    if (element.httpEquiv === 'X-Wix-Meta-Site-Id') {
                        metaSiteId = element.content;
                    } else if (element.httpEquiv === 'X-Wix-Application-Instance-Id') {
                        siteId = element.content;
                    }
                });

                if (siteId && metaSiteId) {
                    var baseEditorUrl = 'http://editor.wix.com/html/editor/web/renderer/edit/' + siteId + '?metaSiteId=' + metaSiteId;
                    var editorUrl = urlUtils.setUrlParams(baseEditorUrl, urlUtils.parseUrl(currentUrl).query);
                    chrome.tabs.create({url: editorUrl});
                }
            });
        }
    };

    _.assign(window, {Utils: utils});
});
