define(['react', 'lodash', 'popup/component.rt'], function (React, _, template) {
    'use strict';

    return React.createClass({
        displayName: 'Wix Component',
        getInitialState: function () {
            return {
                selectedComp: null,
                devtoolsOpen: chrome.extension.getBackgroundPage().isDevToolsOpen()
            };
        },
        handleClick: function () {
            if (this.state.selectedComp) {
                this.setState({selectedComp: null});
                return;
            }

            chrome.extension.getBackgroundPage().selectComponent(this.props.comp.id);
            this.setState({selectedComp: this.props.comp});
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
        isEditable: function (node) {
            return node.path[1] === 'state';
        },
        render: template
    });
});