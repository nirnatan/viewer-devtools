define(['react', 'lodash', 'jsoneditor', 'popup/jsonEditor.rt'], function (React, _, JSONEditor, template) {
    'use strict';

    return React.createClass({
        displayName: 'jsonEditor',
        componentDidMount: function () {
            var options = {
                mode: 'view',
                search: false
            };
            this.editor = new JSONEditor(this.getDOMNode(), options);
            this.editor.set(this.props.json);
        },
        render: template
    });
});
