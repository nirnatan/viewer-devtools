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
            autoRedirect: false
        },
        ReactSource: {
            enabled: false,
            local: false,
            version: ''
        },
        EditorSource: {
            enabled: false,
            local: false,
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
                set: function (value) {
                    var storage;
                    if (_.isObject(value)) {
                        _.assign(localStore[key], value);
                        storage = addPrefix(key, localStore[key]);
                    } else {
                        localStore[key] = value;
                        storage = _.pick(localStore, [key]);
                    }
                    chrome.storage.local.set(storage, _.noop);
                }
            }
        }, handler);
        handler.isReady = handler.isReady || false;
        handler.updateLatestVersions = function (callback) {
            $.ajax({
                url: 'http://itayjiraapp.appspot.com/api/v1/santa/setsantarc?getlink',
                success: function (queryString) {
                    var queryObj = urlUtils.parseUrlParams(queryString);
                    handler.ReactSource.set({
                        version: queryObj.ReactSource.replace('\n', '')
                    });
                    handler.EditorSource.set({
                        version: queryObj.EditorSource.replace('\n', '')
                    });
                    callback();
                }
            });
        }
    }
    init();

    return handler
});