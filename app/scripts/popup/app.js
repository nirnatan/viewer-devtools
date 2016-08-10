define(['react', 'lodash', 'options/dataHandler', 'popup/app.rt'], function (React, _, dataHandler, template) {
    'use strict';

    function getSettings() {
        var settings = dataHandler.settings;
        var reactSource = dataHandler.ReactSource;
        var editorSource = dataHandler.EditorSource;
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
                _.delay(() => {
                    this.setState(getSettings.call(this));
                }, 300);
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
            var settings = dataHandler.settings;
            if (settings.showComponents) {
                backgroundPageUtils.getComponents(this.handleSearchResults);
            }

            backgroundPageUtils.getSiteLocations(locations => {
                this.setState({
                    locations: {
                        previewUrl: settings.showPreviewBtn && locations.previewUrl,
                        publicUrl: settings.showPublicButton && locations.publicUrl
                    }
                });
            });
            backgroundPageUtils.isEditor(value => this.updateState('isEditor', value));
            backgroundPageUtils.isViewer(value => this.updateState('isViewer', value));
            backgroundPageUtils.isPreview(value => this.updateState('isPreview', value));
	        const updateImpersonationMode = value => this.updateState('isImpersonationMode', value);
	        setTimeout(() => {
		        backgroundPageUtils.isImpersonationMode(updateImpersonationMode);
	        }, 100);
        },
        componentDidMount: function () {
            dataHandler.update()
                .then(() => {
                    var state = _.pick(this.state, ['ReactSource', 'EditorSource']);
                    state.ReactSource.versions = dataHandler.ReactSource.versions;
                    state.EditorSource.versions = dataHandler.EditorSource.versions;
                    this.setState(state); //eslint-disable-line react/no-did-mount-set-state
                })
                .catch(() => {
                    this.setState({updateFailed: true}); //eslint-disable-line react/no-did-mount-set-state
                });
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
            dataHandler.set(type, newValue);
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
