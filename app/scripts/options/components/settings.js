define(['react', 'dataHandler', './settings.rt'], function (React, dataHandler, template) {
    'use strict';

    return React.createClass({
        displayName: 'settings',
        getInitialState: function () {
            var emptyState = {
                settings: {}
            };

            setTimeout(function () {
                this.setState({
                    settings: dataHandler.settings.get()
                });
            }.bind(this), 100);

            return emptyState;
        },
        updateSettings: function (settings) {
            settings = _.defaults(settings, this.state.settings);
            dataHandler.settings.set(settings);
            this.setState(settings);
        },
        render: template
    });
});
