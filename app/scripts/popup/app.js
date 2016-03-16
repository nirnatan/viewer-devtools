define(['react', 'lodash', 'options/dataHandler', 'popup/app.rt'], function (React, _, dataHandler, template) {
    'use strict';

    function getSettings() {
        var settings = dataHandler.settings.get();
        var reactSource = dataHandler.ReactSource.get();
        var editorSource = dataHandler.EditorSource.get();
        this.initialVersions = {
            ReactSource: this.backgroundPageUtils.getSantaVersion(),
            EditorSource: this.backgroundPageUtils.getEditorVersion()
        };
        return {
            showComponents: settings.showComponents,
            showVersionSelector: settings.versionSelectorInPopup,
            ReactSource: reactSource,
            EditorSource: editorSource
        };
    }

    return React.createClass({
        displayName: 'Editor DevTools',
        mixins: [React.addons.LinkedStateMixin],
        getInitialState: function () {
            this.backgroundPageUtils = chrome.extension.getBackgroundPage().Utils;

            if (!dataHandler.isReady) {
                _.delay(function () {
                    this.setState(getSettings());
                }.bind(this), 300);
            }

            return _.assign({
                displayName: '',
                comps: [],
                loading: true,
                active: this.backgroundPageUtils.isActive(),
                optionsSet: this.backgroundPageUtils.isOptionsSet(),
                locations: {},
                isEditor: false,
                isViewer: true,
                isPreview: false,
                selectedComp: null,
	            isImpersonationMode: false
            }, getSettings.call(this));
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
                        previewUrl: settings.showPreviewBtn && locations.previewUrl,
                        publicUrl: settings.showPublicButton && locations.publicUrl
                    }
                });
            }.bind(this));
            backgroundPageUtils.isEditor(this.updateState.bind(this, 'isEditor'));
            backgroundPageUtils.isViewer(this.updateState.bind(this, 'isViewer'));
            backgroundPageUtils.isPreview(this.updateState.bind(this, 'isPreview'));
	        const updateImpersonationMode = this.updateState.bind(this, 'isImpersonationMode');
	        setTimeout(function () {
		        backgroundPageUtils.isImpersonationMode(updateImpersonationMode);
	        }, 100);
        },
        componentDidMount: function () {
            dataHandler.updateLatestVersions()
                .then(function () {
                    var state = _.pick(this.state, ['ReactSource', 'EditorSource']);
                    state.ReactSource.versions = dataHandler.ReactSource.get().versions;
                    state.EditorSource.versions = dataHandler.EditorSource.get().versions;
                    this.setState(state); //eslint-disable-line react/no-did-mount-set-state
                }.bind(this))
                .catch(function () {
                    this.setState({updateFailed: true}); //eslint-disable-line react/no-did-mount-set-state
                }.bind(this));
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
            ga('send', 'event', 'Options', type, newValue);
            dataHandler[type].set(newValue);
            var newState = {};
            newState[type] = _.defaults(newValue, this.state[type]);
            newState.optionsSet = this.initialVersions[type] === newValue.version;
            this.setState(newState);
        },
        openEditor: function () {
            chrome.extension.getBackgroundPage().Utils.openEditor();
            ga('send', 'event', 'Viewer', 'Open Editor');
        },
        redirectUrl: function () {
            chrome.extension.getBackgroundPage().Utils.startDebug();
            ga('send', 'event', this.state.isEditor ? 'Editor' : 'Viewer', 'Apply Settings');
            window.close();
        },
        openSettings: function () {
            var optionsURL = chrome.extension.getURL('scripts/options/options.html');
            window.open(optionsURL);
            ga('send', 'event', this.state.isEditor ? 'Editor' : 'Viewer', 'Open Settings');
        },
	    logBackIn: function () {
		    chrome.extension.getBackgroundPage().Utils.logBackIn();
		    window.close();
	    },
        render: template
    });
});
