'use strict';
define(['react', 'lodash', 'popup/app.rt'], function (React, _, template) {
    return React.createClass({
        displayName: 'Editor DevTools',
        mixins: [React.addons.LinkedStateMixin],
        propTypes: {
            autoRedirect: React.PropTypes.bool
        },
        getInitialState: function () {
            return {
                displayName: '',
                comps: []
            };
        },
        componentWillMount: function () {
            chrome.extension.getBackgroundPage().getComponents(this.handleSearchResults);
        },
        handleSearchResults: function (results) {
            this.setState({comps: results});
        },
        getComponents: function () {
            return _.filter(this.state.comps, function (comp) {
                return new RegExp(this.state.displayName, 'ig').test(comp.name || comp.id || comp.domId);
            }, this);
        },
        render: template
    });
});