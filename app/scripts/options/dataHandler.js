define(['jquery', 'lodash', 'utils/urlUtils', 'json!generated/santa.json', 'json!generated/santa-editor.json', 'json!generated/packages.json'], function ($, _, urlUtils, viewerExp, editorExp, packagesNames) {
    'use strict';

    var localStore = {
        experiments: _(viewerExp.concat(editorExp))
            .zipObject()
            .mapValues(Boolean)
            .value(),
        packages: _(packagesNames)
            .zipObject()
            .mapValues(Boolean)
            .value(),
        settings: {
            disableLeavePagePopUp: false,
            disableNewRelic: true
        },
        ReactSource: {
            enabled: false,
            local: false,
            versions: [],
            version: ''
        },
        EditorSource: {
            enabled: false,
            local: false,
            versions: [],
            version: ''
        }
    };

    function addPrefix(prefix, object) {
        return _.transform(object, function (acc, value, key) {
            acc[prefix + '.' + key] = value;
        });
    }

    function removePrefix(prefix, object) {
        return _.transform(object, function (acc, value, key) {
            acc[key.slice(prefix.length + 1)] = value;
        });
    }

    chrome.storage.onChanged.addListener(function () {
        updateDataFromStorage();
    });

    function updateDataFromStorage() {
        return Promise.all(_.map(localStore, function (value, key) {
            var defer = Promise.defer();
            chrome.storage.local.get(_.keys(addPrefix(key, value)), function (result) {
                var storage = removePrefix(key, result);
                _.assign(value, storage);
                defer.resolve();
            });

            return defer.promise;
        }));
    }

    var handler = {};
    function init() {
        updateDataFromStorage()
            .then(function () {
                handler.isReady = true;
            });
        handler = _.transform(localStore, function (acc, value, key) {
            acc[key] = {
                get: function () {
                    return localStore[key];
                },
                set: function (newValue) {
                    var storage;
                    if (_.isObject(newValue)) {
                        _.assign(localStore[key], newValue);
                        storage = addPrefix(key, localStore[key]);
                    } else {
                        localStore[key] = newValue;
                        storage = _.pick(localStore, [key]);
                    }
                    chrome.storage.local.set(storage, _.noop);
                }
            };
        }, handler);
        handler.isReady = handler.isReady || false;
        handler.updateLatestVersions = function () {
            var editorRcs = $.get('http://rudolph.wixpress.com/services/availableRcs?project=santa-editor');
            var editorGA = $.get('http://rudolph.wixpress.com/services/versionsProjectGa?project=santa-editor');
            var santaGA = $.get('http://rudolph.wixpress.com/services/versionsProjectGa?project=santa-viewer');
            var santaRcs = $.get('http://rudolph.wixpress.com/services/availableRcs?project=santa-viewer');
            return Promise.all([editorRcs, editorGA, santaRcs, santaGA])
                .then(function (responses) {
                    var editorVersions = ['local'].concat(_(responses[0].result).reverse().value());
                    handler.EditorSource.set({
                        version: localStore.EditorSource.version || responses[1].result,
                        versions: editorVersions
                    });
                    var santaVersions = ['local'].concat(_(responses[2].result).reverse().value());
                    handler.ReactSource.set({
                        version: localStore.ReactSource.version || responses[3].result,
                        versions: santaVersions
                    });
                });
        };
    }

    init();

    return handler;
});