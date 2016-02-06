define(['react', 'lodash', 'options/components/versionSelector.rt'], function (React, _, template) {
    'use strict';

    return React.createClass({
        displayName: 'versionSelector',
        propTypes: {
            label: React.PropTypes.string,
            selectedVersion: React.PropTypes.string,
            versions: React.PropTypes.arrayOf(React.PropTypes.string),
            updateSource: React.PropTypes.func
        },
        render: template
    });
});
