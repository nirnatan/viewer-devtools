define(['react', 'lodash', 'popup/component.rt'], function (React, _, template) {
    'use strict';

    return React.createClass({
        displayName: 'Wix Component',
        propTypes: {
            selectedComp: React.PropTypes.object,
            onSelectionChanged: React.PropTypes.func,
            comp: React.PropTypes.object
        },
        getInitialState: function () {
            return {
                devtoolsOpen: chrome.extension.getBackgroundPage().Utils.isDevToolsOpen()
            };
        },
        handleClick: function () {
            chrome.extension.getBackgroundPage().Utils.selectComponent(this.props.comp.id);
            this.props.onSelectionChanged(this.props.comp);
        },
        inspectElement: function () {
            var backgroundPage = chrome.extension.getBackgroundPage();
            backgroundPage.Utils.selectComponent(this.props.comp.id, function (props) {
                chrome.extension.getBackgroundPage().Utils.inspectElement(props);
            });
            backgroundPage.Utils.markComponent(null);
        },
        setCompState: function () {
            var state = this.refs.propJson.get().state;
            chrome.extension.getBackgroundPage().Utils.setState(this.props.comp.domId, state);
        },
        isSelected: function () {
            var selectedCompId = this.props.selectedComp && this.props.selectedComp.id;
            return selectedCompId === this.props.comp.id;
        },
        isEditable: function (node) {
            return node.path[1] === 'state';
        },
        render: template
    });
});