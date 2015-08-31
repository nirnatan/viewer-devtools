require(['lodash', 'dataHandler', 'utils/urlUtils'], function (_, dataHandler, urlUtils) {
    'use strict';
    function isWix() {
        var wix = /editor\.wix.*\.com/g;
        if (wix.test(window.location.href)) {
            return true;
        }

        var elms = document.getElementsByTagName('meta');
        for (var i = 0; i < elms.length; i++) {
            var el = elms[i];
            if (el.getAttribute('http-equiv') === "X-Wix-Renderer-Server") {
                return true;
            }
        }

        return false;
    }

    function getRedirectCode(newUrl) {
        function redirect(url) {
            window.location.href = url;
        }

        return '(' + redirect.toString() + ')("' + newUrl + '")';
    }

    chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
        var isLoading = changeInfo.status === 'loading';
        var changeUrl = changeInfo.url;
        var shouldRedirect = dataHandler.settings.get().autoRedirect && changeUrl !== applyEditorParams(changeUrl);
        if (isLoading && shouldRedirect && changeUrl && !changeUrl.startsWith('chrome://')) {
            window.redirect(applyEditorParams(changeUrl), tabId);
        }
    });

    var sendToContentPage = function (request, sendResponse) {
        chrome.tabs.getSelected(null, function (tab) {
            chrome.tabs.sendMessage(tab.id, request, function () {
                if (sendResponse) {
                    sendResponse.apply(this, arguments);
                }
            });
        });
    };

    window.redirect = function redirect(url, tabId) {
        if (!tabId) {
            chrome.tabs.getSelected(null, function (tab) {
                window.redirect(url, tab.id);
            });
            return;
        }

        var code = '(' + isWix.toString() + ')()';
        chrome.tabs.executeScript(tabId, {code: code, allFrames: true}, function (isWixPage) {
            if (isWixPage && isWixPage.indexOf(true) !== -1) {
                chrome.tabs.executeScript(tabId, {code: getRedirectCode(url)});
            }
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

    window.startDebug = function startDebug() {
        chrome.tabs.getSelected(null, function (tab) {
            window.redirect(applyEditorParams(tab.url));
        });
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

    window.isActive = function isActive(callback) {
        chrome.tabs.getSelected(null, function (tab) {
            callback(tab.url === applyEditorParams(tab.url));
        });
    };

    //chrome.webRequest.onBeforeRequest.addListener(function (details) {
    //        var autoRedirect = dataHandler.settings.get().autoRedirect;
    //        if (details.type !== 'xmlhttprequest' && autoRedirect) {
    //            return {
    //                redirectUrl: applyEditorParams(details.url)
    //
    //            };
    //        }
    //    },
    //    {
    //        urls: ['http://*/*']
    //    },
    //    ['blocking']);

    function applyEditorParams(url) {
        var urlObj = urlUtils.parseUrl(url);
        urlObj.search = urlUtils.getEditorQueryString(dataHandler, urlObj);

        return urlUtils.buildFullUrl(urlObj);
    }
});
