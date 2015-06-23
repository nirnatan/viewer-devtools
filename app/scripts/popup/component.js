'use strict';
define(['react', 'popup/component.rt'], function (React, template) {

    return React.createClass({
        displayName: 'Wix Component',
        getInitialState: function () {
            return {
                compProps: null
            };
        },
        handleClick: function () {
            if (this.state.compProps) {
                this.setState({compProps: null});
                return;
            }

            chrome.extension.getBackgroundPage().selectComponent(this.props.comp.id, function(props) {
                this.setState({compProps: props});
            }.bind(this));
        },
        inspectElement: function () {
            var backgroundPage = chrome.extension.getBackgroundPage();
            backgroundPage.selectComponent(this.props.comp.id, function (props) {
                chrome.extension.getBackgroundPage().inspectElement(props);
            });
            backgroundPage.markComponent(null);
        },
        render: template
    });
});