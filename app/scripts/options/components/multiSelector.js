define(['react', 'lodash', './multiSelector.rt'], function (React, _, template) {
    'use strict';

    return React.createClass({
        displayName: 'multiSelector',
        propTypes: {
            label: React.PropTypes.string,
            items: React.PropTypes.arrayOf(React.PropTypes.string),
            selectAll: React.PropTypes.function,
            onItemChanged: React.PropTypes.function
        },
        render: template
    });
});
