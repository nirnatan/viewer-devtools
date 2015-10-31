define(['react', 'lodash', 'options/components/versionSelector.rt'], function (React, _, template) {
    'use strict';

    return React.createClass({
        displayName: 'versionSelector',
        propTypes: {
            label: React.PropTypes.string,
            enabled: React.PropTypes.bool,
            local: React.PropTypes.bool,
            version: React.PropTypes.string,
            updateSource: React.PropTypes.func
        },
        render: template
    });
});
