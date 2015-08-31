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
                selectedComp: null
            };
        },
        componentWillMount: function () {
            chrome.extension.getBackgroundPage().getComponents(this.handleSearchResults);
            chrome.extension.getBackgroundPage().isActive(this.updateActiveState);
        },
        handleSearchResults: function (results) {
            this.setState({comps: results, loading: false});
        },
        updateActiveState: function (active) {
            this.setState({active: active});
        },
        getComponents: function () {
            return _.filter(this.state.comps, function (comp) {
                return new RegExp(this.state.displayName, 'ig').test(comp.name || comp.id || comp.domId);
            }, this);
        },
        redirectUrl: function () {
            chrome.extension.getBackgroundPage().startDebug();
            window.close();
        },
        render: template
    });
});