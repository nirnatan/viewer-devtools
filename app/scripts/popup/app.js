define(['react', 'lodash', 'options/dataHandler', 'popup/app.rt'], function (React, _, dataHandler, template) {
    'use strict';

    function getSettings() {
        var settings = dataHandler.settings.get();
        return {
            showComponents: settings.showComponents,
            showVersionSelector: settings.versionSelectorInPopup,
            ReactSource: dataHandler.ReactSource.get(),
            EditorSource: dataHandler.EditorSource.get()
        };
    }

    return React.createClass({
        displayName: 'Editor DevTools',
        mixins: [React.addons.LinkedStateMixin],
        getInitialState: function () {
            var backgroundPageUtils = chrome.extension.getBackgroundPage().Utils;

            if (!dataHandler.isReady) {
                _.delay(function () {
                    this.setState(getSettings());
                }.bind(this), 300);
            }

            return _.assign({
                displayName: '',
                comps: [],
                loading: true,
                active: backgroundPageUtils.isActive(),
                optionsSet: backgroundPageUtils.isOptionsSet(),
                locations: {},
                isEditor: false,
                isViewer: true,
                isPreview: false,
                selectedComp: null
            }, getSettings());
        },
        componentWillMount: function () {
            var backgroundPageUtils = chrome.extension.getBackgroundPage().Utils;
            var settings = dataHandler.settings.get();
            if (settings.showComponents) {
                backgroundPageUtils.getComponents(this.handleSearchResults);
            }

            backgroundPageUtils.getSiteLocations(function (locations) {
                this.setState({
                    locations: {
                        previewUrl: locations.previewUrl && settings.showPreviewBtn,
                        publicUrl: locations.publicUrl && settings.showPublicButton
                    }
                });
            }.bind(this));
            backgroundPageUtils.isEditor(this.updateState.bind(this, 'isEditor'));
            backgroundPageUtils.isViewer(this.updateState.bind(this, 'isViewer'));
            backgroundPageUtils.isPreview(this.updateState.bind(this, 'isPreview'));
        },
        componentWillUpdate: function () {
            if (this.state.showComponents && this.state.loading) {
                chrome.extension.getBackgroundPage().Utils.getComponents(this.handleSearchResults);
            }
        },
        handleSearchResults: function (results) {
            this.setState({comps: results, loading: false});
        },
        updateState: function (property, value) {
            var state = {};
            state[property] = value;
            this.setState(state);
        },
        getComponents: function () {
            return _.filter(this.state.comps, function (comp) {
                return new RegExp(this.state.displayName, 'ig').test(comp.name || comp.id || comp.domId);
            }, this);
        },
        updateVersions: function (type, newValue) {
            var newState = {};
            newState[type] = _.defaults(newValue, this.state[type]);
            this.setState(newState);

            dataHandler[type].set(newValue);
        },
        openEditor: function () {
            chrome.extension.getBackgroundPage().Utils.openEditor();
        },
        redirectUrl: function () {
            chrome.extension.getBackgroundPage().Utils.startDebug();
            window.close();
        },
        openSettings: function () {
            var optionsURL = chrome.extension.getURL('scripts/options/options.html');
            window.open(optionsURL);
        },
        render: template
    });
});