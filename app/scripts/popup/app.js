define(['react', 'lodash', 'popup/app.rt'], function (React, _, template) {
    'use strict';

    return React.createClass({
        displayName: 'Editor DevTools',
        mixins: [React.addons.LinkedStateMixin],
        getInitialState: function () {
            var backgroundPageUtils = chrome.extension.getBackgroundPage().Utils;

            return {
                displayName: '',
                comps: [],
                loading: true,
                active: backgroundPageUtils.isActive(),
                isEditor: true,
                selectedComp: null
            };
        },
        componentWillMount: function () {
            var backgroundPageUtils = chrome.extension.getBackgroundPage().Utils;
            backgroundPageUtils.getComponents(this.handleSearchResults);
            backgroundPageUtils.isEditor(this.updateState.bind(this, 'isEditor'));
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
        render: template
    });
});