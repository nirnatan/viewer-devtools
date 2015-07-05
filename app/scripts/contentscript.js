(function () {
    'use strict';
    /*!
     * querystring - Simple querystring lib with no dependencies
     * v0.1.0
     * https://github.com/jgallen23/querystring
     * copyright Greg Allen 2013
     * MIT License
     */
    var querystring = {
        parse: function (string) {
            var parsed = {};
            string = (string !== undefined) ? string : window.location.search;

            if (typeof string === 'string' && string.length > 0) {
                if (string[0] === '?') {
                    string = string.substring(1);
                }

                string = string.split('&');

                for (var i = 0, length = string.length; i < length; i++) {
                    var element = string[i],
                        eqPos = element.indexOf('='),
                        keyValue, elValue;

                    if (eqPos >= 0) {
                        keyValue = element.substr(0, eqPos);
                        elValue = element.substr(eqPos + 1);
                    }
                    else {
                        keyValue = element;
                        elValue = '';
                    }

                    elValue = decodeURIComponent(elValue);

                    if (parsed[keyValue] === undefined) {
                        parsed[keyValue] = elValue;
                    }
                    else if (parsed[keyValue] instanceof Array) {
                        parsed[keyValue].push(elValue);
                    }
                    else {
                        parsed[keyValue] = [parsed[keyValue], elValue];
                    }
                }
            }

            return parsed;
        },
        stringify: function (obj) {
            var string = [];

            if (!!obj && obj.constructor === Object) {
                for (var prop in obj) {
                    if (obj[prop] instanceof Array) {
                        for (var i = 0, length = obj[prop].length; i < length; i++) {
                            string.push([encodeURIComponent(prop), encodeURIComponent(obj[prop][i])].join('='));
                        }
                    }
                    else {
                        string.push([encodeURIComponent(prop), encodeURIComponent(obj[prop])].join('='));
                    }
                }
            }

            return string.join('&');
        }
    };

    function sendMessageToActionScript(msg, sender, sendResponse) {
        var listener = function (evt) {
            sendResponse(evt.detail);
        };

        document.addEventListener('Editor_Response', listener);

        document.dispatchEvent(new CustomEvent('Editor_Command', {detail: msg}));
    }

    var injected = false;
    chrome.extension.onMessage.addListener(function (msg, sender, sendResponse) {
        if (!injected) {
            injectScripts(function () {
                sendMessageToActionScript(msg, sender, sendResponse);
            });
            injected = true;
            return true;
        }

        sendMessageToActionScript(msg, sender, sendResponse);
    });

    function addDebugToUrl() {
        var params = querystring.parse(window.location.search);
        if (params.debug && (params.debug === 'react' || params.debug.indexOf('react') !== -1)) {
            return;
        }

        params.debug = [].concat(params.debug || [], 'react');

        window.location.search = querystring.stringify(params);
    }

    var scriptReady = function () {
        document.removeEventListener('scriptReady', scriptReady);
        chrome.storage.local.get('autoRedirect', function (result) {
            if (result.autoRedirect) {
                var validated = false;
                sendMessageToActionScript({type: 'isDebuggable'}, null, function (debuggable) {
                    if (!validated) {
                        validated = true;
                        if (!debuggable) {
                            addDebugToUrl();
                        }
                    }

                });
            }
        });
    };

    document.addEventListener('scriptReady', scriptReady);

    function injectScripts(callback) {
        var injectedScripts = ['scripts/contentActions.js', 'scripts/utils/jsonUtils.js'];
        var loadedScripts = 0;
        injectedScripts.forEach(function (script) {
            var s = document.createElement('script');
            s.src = chrome.extension.getURL(script);
            document.body.appendChild(s);
            s.onload = function () {
                s.parentNode.removeChild(s);
                if (++loadedScripts === injectedScripts.length) {
                    callback();
                }
            };
        });
    }
}());