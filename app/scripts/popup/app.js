define(['react', 'lodash', 'options/dataHandler', 'popup/app.rt'], function (React, _, dataHandler, template) {
    'use strict';

    return React.createClass({
        displayName: 'Editor DevTools',
        mixins: [React.addons.LinkedStateMixin],
        getInitialState: function () {
            var backgroundPageUtils = chrome.extension.getBackgroundPage().Utils;

            if (!dataHandler.isReady) {
                _.delay(this.setState.bind(this, {showComponents: dataHandler.settings.get().showComponents}), 300);
            }

            return {
                displayName: '',
                comps: [],
                loading: true,
                active: backgroundPageUtils.isActive(),
                optionsSet: backgroundPageUtils.isOptionsSet(),
                isEditor: false,
                isViewer: true,
                selectedComp: null,
                showComponents: dataHandler.settings.get().showComponents
            };
        },
        componentWillMount: function () {
            var backgroundPageUtils = chrome.extension.getBackgroundPage().Utils;
            if (dataHandler.settings.get().showComponents) {
                backgroundPageUtils.getComponents(this.handleSearchResults);
            }
            backgroundPageUtils.isEditor(this.updateState.bind(this, 'isEditor'));
            backgroundPageUtils.isViewer(this.updateState.bind(this, 'isViewer'));
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