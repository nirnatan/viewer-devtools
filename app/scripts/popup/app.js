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
                selectedComp: null
            };
        },
        componentWillMount: function () {
            chrome.extension.getBackgroundPage().getComponents(this.handleSearchResults);
        },
        handleSearchResults: function (results) {
            this.setState({comps: results, loading: false});
        },
        getComponents: function () {
            return _.filter(this.state.comps, function (comp) {
                return new RegExp(this.state.displayName, 'ig').test(comp.name || comp.id || comp.domId);
            }, this);
        },
        redirectUrl: function () {
            chrome.extension.getBackgroundPage().startDebug();
        },
        render: template
    });
});