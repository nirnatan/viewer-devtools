'use strict';
define(['react', 'popup/component.rt'], function(React, template) {
	return React.createClass({
		displayName: 'Wix Component',
		mixins: [React.addons.LinkedStateMixin],
        contextTypes: {
            fire: React.PropTypes.func.isRequired
        },
        getInitialState: function () {
			return {
                props: null
            };
		},
        getProps: function (props) {
            this.setState({
                props: props
            });
        },
		render: template
	});
});