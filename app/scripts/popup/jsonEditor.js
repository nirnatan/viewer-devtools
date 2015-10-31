define(['react', 'lodash', 'react-dom', 'jsoneditor', 'popup/jsonEditor.rt'], function (React, _, ReactDOM, JSONEditor, template) {
    'use strict';

    return React.createClass({
        displayName: 'jsonEditor',
        componentDidMount: function () {
            var options = {
                mode: this.props.type || 'view',
                search: false,
                name: this.props.name.substring(0, 30),
                editable: this.props.editable
            };
            this.editor = new JSONEditor(ReactDOM.findDOMNode(this.refs.json), options, _.merge({}, this.props.json));
        },
        inspectElement: function () {
            chrome.extension.getBackgroundPage().Utils.inspectElement(this.props.domId);
        },
        get: function () {
            return this.editor.get();
        },
        render: template
    });
});
