define(['react', 'lodash', './switchMode.rt'], function (React, _, template) {
    'use strict';

    return React.createClass({
        displayName: 'switchMode',
        getInitialState: function () {
            return {
                isMobile: false
            };
        },
        componentWillMount: function () {
            chrome.extension.getBackgroundPage().Utils.isMobile(function (isMobile) {
                this.setState({
                    isMobile: isMobile
                });
            }.bind(this));
        },
        changeMode: function (mobile) {
            chrome.extension.getBackgroundPage().Utils.setMobileView(mobile);
            window.close();
        },
        render: template
    });
});
