define(['react', 'lodash', 'popup/component.rt'], function (React, _, template) {
    'use strict';

    return React.createClass({
        displayName: 'Wix Component',
        propTypes: {
            selectedComp: React.PropTypes.object,
            onSelectionChanged: React.PropTypes.function,
            comp: React.PropTypes.object
        },
        getInitialState: function () {
            return {
                devtoolsOpen: chrome.extension.getBackgroundPage().isDevToolsOpen()
            };
        },
        handleClick: function () {
            chrome.extension.getBackgroundPage().selectComponent(this.props.comp.id);
            this.props.onSelectionChanged(this.props.comp);
        },
        inspectElement: function () {
            var backgroundPage = chrome.extension.getBackgroundPage();
            backgroundPage.selectComponent(this.props.comp.id, function (props) {
                chrome.extension.getBackgroundPage().inspectElement(props);
            });
            backgroundPage.markComponent(null);
        },
        setCompState: function () {
            var state = this.refs.propJson.get().state;
            var backgroundPage = chrome.extension.getBackgroundPage();
            backgroundPage.setState(this.props.comp.domId, state);
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