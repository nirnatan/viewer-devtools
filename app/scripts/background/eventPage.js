require(['lodash', 'dataHandler', 'utils/urlUtils'], function (_, dataHandler, urlUtils) {
    'use strict';
    function getMetaId() {
        //Get the meta side id for the link
        var metaElements = document.getElementsByTagName('meta');
        for (var i = 0; i < metaElements.length; i++) {
            if (metaElements[i].getAttribute('http-equiv') === "X-Wix-Meta-Site-Id") {
                return metaElements[i].getAttribute('content');
            }
        }
        return "noMetaSiteId";
    }

    function getAppId() {
        var metaElements = document.getElementsByTagName('meta');
        for (var i = 0; i < metaElements.length; i++) {
            if (metaElements[i].getAttribute('http-equiv') === "X-Wix-Application-Instance-Id") {
                return metaElements[i].getAttribute('content');
            }
        }
        return "noAppInstanceId";
    }

    function isEditorSite() {
        var metaElements = document.getElementsByTagName('meta');
        for (var i = 0; i < metaElements.length; i++) {
            if (metaElements[i].getAttribute('http-equiv') === "X-Wix-Editor-Server") {
                return 1;
            }
        }
        return 0;
    }

    function isViewerSite() {
        var metaElements = document.getElementsByTagName('meta');
        for (var i = 0; i < metaElements.length; i++) {
            if (metaElements[i].getAttribute('http-equiv') === "X-Wix-Renderer-Server") {
                return 1;
            }
        }
        return 0;
    }

    function openEditorPage(metaSiteId, siteId) {
        var queryString = window.location.search ? window.location.search.substring(1) : '';
        var url = "http://editor.wix.com/html/editor/web/renderer/edit/" + siteId + "?metaSiteId=" + metaSiteId + (queryString ? '&' + queryString : '');
        window.open(url);
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
            var isWixCode = '(function () { ' + isEditorSite.toString() + '\n' + isViewerSite.toString() + '\n return isEditorSite() || isViewerSite();\n})()';
            chrome.tabs.executeScript(tabId, {code: isWixCode, allFrames: true}, function (isWixPage) {
                if (isWixPage && isWixPage.indexOf(true) !== -1) {
                    window.redirect(applyEditorParams(changeUrl), tabId);
                }
            });
        }
    });

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

    function sendToContentPage(request, sendResponse) {
        chrome.tabs.getSelected(null, function (tab) {
            chrome.tabs.sendMessage(tab.id, request, function () {
                if (sendResponse) {
                    sendResponse.apply(this, arguments);
                }
            });
        });
    }

    window.redirect = function redirect(url, tabId) {
        if (!tabId) {
            chrome.tabs.getSelected(null, function (tab) {
                window.redirect(url, tab.id);
            });
            return;
        }

        chrome.tabs.executeScript(tabId, {code: getRedirectCode(url)});
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

    window.isEditor = function isViewer(callback) {
        chrome.tabs.getSelected(null, function (tab) {
            var isEditorUrl = /^https?:\/\/editor\.wix\.com\//.test(tab.url);
            console.log('isEditor = ', isEditorUrl, ' (', tab.url, ')');
            callback(isEditorUrl);
        });
    };

    window.openEditor = function openEditor() {
        chrome.tabs.getSelected(null, function (tab) {
            console.log('openEditor: ' + tab.url);
            var code = '(function() {' +
                getMetaId.toString() + '\n' +
                getAppId.toString() + '\n' +
                isViewerSite.toString() + '\n' +
                openEditorPage.toString() + '\n ' +
                'if(isViewerSite()) { openEditorPage(getMetaId(), getAppId()); }})();';
            chrome.tabs.executeScript(tab.id, {code: code});
        });
    };

    function applyEditorParams(url) {
        var urlObj = urlUtils.parseUrl(url);
        urlObj.search = urlUtils.getEditorQueryString(dataHandler, urlObj);

        return urlUtils.buildFullUrl(urlObj);
    }
});
