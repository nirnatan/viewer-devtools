'use strict';
define(['react', 'lodash', 'popup/app.rt'], function (React, _, template) {
    return React.createClass({
        displayName: 'Editor DevTools',
        mixins: [React.addons.LinkedStateMixin],
        getInitialState: function () {
            return {
                displayName: '',
                comps: []
            };
        },
        componentWillMount: function () {
            setTimeout(this.props.fire.bind(this, 'search', '', this.handleSearchResults), 0);
        },
        childContextTypes: {
             fire: React.PropTypes.func.isRequired
        },
        getChildContext: function() {
             return { fire: this.props.fire };
        },
        handleSearchResults: function (results) {
            this.setState({comps: results});
        },
        getComponents: function () {
            return _.filter(this.state.comps, function (comp) {
                return new RegExp(this.state.displayName, 'ig').test(comp.name || comp.id);
            }, this)
        },
        handleClick: function (evt) {
            if (evt.key === "Enter") {
                this.props.fire('search', this.state.displayName, this.handleSearchResults);
            }
        },
        render: template
    });
});