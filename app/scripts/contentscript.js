'use strict';

var injectedScripts = ['scripts/contentActions.js', 'scripts/utils/jsonUtils.js'];
injectedScripts.forEach(function (script) {
    var s = document.createElement('script');
    s.src = chrome.extension.getURL(script);
    (document.head || document.documentElement).appendChild(s);
    s.onload = function () {
        s.parentNode.removeChild(s);
    };
});

chrome.extension.onMessage.addListener(function (msg, sender, sendResponse) {
    var listener = function (evt) {
        sendResponse(evt.detail);
    };

    document.addEventListener('Editor_Response', listener);

    document.dispatchEvent(new CustomEvent('Editor_Command', {detail: msg}));
});
