define(['react', 'lodash', 'popup/app.rt'], function (React, _, template) {
    'use strict';

    return React.createClass({
        displayName: 'Editor DevTools',
        mixins: [React.addons.LinkedStateMixin],
        getInitialState: function () {
            return {
                displayName: '',
                comps: [],
                loading: true,
                active: false,
                isEditor: false,
                selectedComp: null
            };
        },
        componentWillMount: function () {
            chrome.extension.getBackgroundPage().getComponents(this.handleSearchResults);
            chrome.extension.getBackgroundPage().isActive(this.updateState.bind(this, 'active'));
            chrome.extension.getBackgroundPage().isEditor(this.updateState.bind(this, 'isEditor'));
        },
        handleSearchResults: function (results) {
            this.setState({comps: results, loading: false});
        },
        updateState: function (property, value) {
            var state = {};
            state[property] = value;
            console.log('updateState: ' + JSON.stringify(state, null, 4));
            this.setState(state);
        },
        getComponents: function () {
            return _.filter(this.state.comps, function (comp) {
                return new RegExp(this.state.displayName, 'ig').test(comp.name || comp.id || comp.domId);
            }, this);
        },
        openEditor: function () {
            chrome.extension.getBackgroundPage().openEditor();
        },
        redirectUrl: function () {
            chrome.extension.getBackgroundPage().startDebug();
            window.close();
        },
        render: template
    });
});