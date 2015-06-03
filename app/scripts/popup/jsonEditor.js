define(['react', 'lodash', 'jsoneditor', 'popup/jsonEditor.rt'], function (React, _, JSONEditor, template) {
    'use strict';

    return React.createClass({
        displayName: 'jsonEditor',
        componentDidMount: function () {
            var options = {
                mode: 'view',
                search: false,
                name: this.props.name
            };
            this.editor = new JSONEditor(this.refs.json.getDOMNode(), options, _.merge({}, this.props.json));
        },
        inspectElement: function () {
            chrome.extension.getBackgroundPage().inspectElement(this.props.domId);
        },
        render: template
    });
});
