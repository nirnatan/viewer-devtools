require(['lodash', 'dataHandler', 'utils/urlUtils'], function (_, dataHandler, urlUtils) {
    'use strict';

    var ports = [];
    var tabId, currentUrl;

    function updateBrowserActionIcon() {
        isWixSite(function (wixSite) {
            chrome.browserAction.setIcon({
                path: {
                    "19": 'images/icon-19' + (wixSite ? '' : '-disabled') + '.png',
                    "38": 'images/icon-38' + (wixSite ? '' : '-disabled') + '.png'
                }
            });
        });
    }

    chrome.tabs.onActiveChanged.addListener(function (id) {
        chrome.tabs.get(id, function (tab) {
            if (tab.url.indexOf('chrome-devtools') !== 0) {
                currentUrl = tab.url;
                tabId = id;
                updateBrowserActionIcon();
            }
        });
    });

    chrome.tabs.onUpdated.addListener(function (id, changeInfo, tab) {
        if (tabId === id) {
            currentUrl = changeInfo.url || tab.url;
            updateBrowserActionIcon();
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
            metaElementsCallback(_.first(metaElementsResult));
        });
    }

    function getPreviewUrl() {
        var code = '(function() { return document.getElementById("preview").src; })();';

        return new Promise(function (resolve) {
            chrome.tabs.executeScript(tabId, {code: code}, function (comp) {
                resolve(_.first(comp));
            });
        });
    }

    function getSitePublicUrl() {
        return new Promise(function (resolve) {
            sendToContentPage({type: 'getSitePublicUrl'}, resolve);
        });
    }

    function sendToContentPage(request, sendResponse) {
        chrome.tabs.sendMessage(tabId, request, function () {
            if (sendResponse) {
                sendResponse.apply(this, arguments);
            }
        });
    }

    function applyOptions(url, viewrOnly) {
        var urlObj = urlUtils.parseUrl(url);
        urlObj.query = urlUtils.getOptionsQueryString(dataHandler, urlObj, viewrOnly);

        return urlUtils.buildFullUrl(urlObj);
    }

    function createOrActivateEditorTab(siteId, metaSiteId) {
        function setUrl() {
            chrome.tabs.getAllInWindow(function (tabs) {
                var baseEditorUrl = 'http://editor.wix.com/html/editor/web/renderer/edit/' + siteId;
                var urlObj = urlUtils.parseUrl(currentUrl);
                urlObj.query.metaSiteId = metaSiteId;
                var editorUrl = urlUtils.setUrlParams(baseEditorUrl, urlUtils.getOptionsQueryString(dataHandler, urlObj));

                var editorTab = _.find(tabs, function (tab) {
                    var tabUrlObj = urlUtils.parseUrl(tab.url);
                    return tabUrlObj.query.metaSiteId === metaSiteId && _.endsWith(tabUrlObj.path, siteId);
                });

                if (!editorTab) {
                    chrome.tabs.create({url: editorUrl});
                } else {
                    chrome.tabs.update(editorTab.id, {selected: true});
                }
            });
        }

        dataHandler.updateLatestVersions()
            .then(setUrl)
            .catch(setUrl);
    }

    function isWixSite(callback) {
        if (urlUtils.parseUrl(currentUrl).host === 'editor.wix.com') {
            callback(true);
            return;
        }

        utils.isEditor(function (editor) {
            if (editor) {
                callback(true);
                return;
            }

            utils.isViewer(callback);
        });
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

	    isImpersonationMode: function (callback) {
  		    sendToContentPage({type: 'getCurrentUsername'}, function (currentUsername) {
		        var username = dataHandler.settings.username;
		        callback(username && (username !== currentUsername));
	        });
  	    },

        logBackIn: function () {
	        chrome.tabs.create({url: 'https://users.wix.com/wix-users/login/form'});
        },

        getSiteLocations: function (callback) {
            Promise.all([
                getSitePublicUrl(),
                getPreviewUrl()
            ]).then(function (urls) {
                callback({
                    publicUrl: urls[0],
                    previewUrl: urls[1]
                });
            });
        },

        startDebug: function () {
            function updateUrl() {
                utils.isEditor(function (editor) {
                    if (editor) {
                        chrome.tabs.update(tabId, {url: applyOptions(currentUrl, false)});
                    }
                });

                utils.isViewer(function (viewer) {
                    if (viewer) {
                        chrome.tabs.update(tabId, {url: applyOptions(currentUrl, true)});
                    }
                });
            }

            dataHandler.updateLatestVersions()
                .then(updateUrl)
                .catch(updateUrl);
        },

        moveToPage: function (url) {
            chrome.tabs.getAllInWindow(function (tabs) {
                var existingTab = _.find(tabs, function (tab) {
                    return tab.url === url;
                });

                if (existingTab) {
                    chrome.tabs.update(existingTab.id, {selected: true});
                } else {
                    chrome.tabs.create({url: url});
                }
            });
        },

        setMobileView: function (isMobile) {
            var newUrl = urlUtils.parseUrl(currentUrl);
            if (!isMobile) {
                delete newUrl.query.showMobileView;
            } else {
                newUrl.query.showMobileView = isMobile;
            }

            chrome.tabs.update(tabId, {url: urlUtils.buildFullUrl(newUrl)});
        },

        isMobile: function (callback) {
            callback(urlUtils.hasParam(currentUrl, 'showMobileView', 'true'));
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
            return currentUrl === applyOptions(currentUrl);
        },

        getSantaVersion: function () {
            var reactSource = urlUtils.parseUrl(currentUrl).query.ReactSource;
            if (_.startsWith(reactSource, 'http://localhost')) {
                return 'local';
            }
            return reactSource;
        },

        getEditorVersion: function () {
            var editorSource = urlUtils.parseUrl(currentUrl).query.EditorSource;
            if (_.startsWith(editorSource, 'http://localhost')) {
                return 'local';
            }
            return editorSource;
        },

        isPreview: function (callback) {
            utils.isEditor(function (editor) {
                callback(!editor && urlUtils.parseUrl(currentUrl).host === 'editor.wix.com');
            });
        },

        isViewer: function (callback) {
            var metaElementsCallback = function (metaElements) {
                var hasViewerMetaTag = metaElements && metaElements.reduce(function (acc, element) {
                    return acc || element.httpEquiv === 'X-Wix-Renderer-Server';
                }, false);
                callback(hasViewerMetaTag);
            };

            getMetaElements(metaElementsCallback);
        },

        isEditor: function (callback) {
            var metaElementsCallback = function (metaElements) {
                var hasEditorMetaTag = metaElements && metaElements.reduce(function (acc, element) {
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
                    createOrActivateEditorTab(siteId, metaSiteId);
                }
            });
        }
    };

    _.assign(window, {Utils: utils});
});
