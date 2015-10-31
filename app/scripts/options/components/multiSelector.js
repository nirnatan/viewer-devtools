define(['react', 'lodash', './multiSelector.rt'], function (React, _, template) {
    'use strict';

    return React.createClass({
        displayName: 'multiSelector',
        propTypes: {
            label: React.PropTypes.string,
            items: React.PropTypes.object,
            selectAll: React.PropTypes.func,
            onItemChanged: React.PropTypes.func
        },
        render: template
    });
});
