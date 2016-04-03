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
                    settings: dataHandler.settings
                });
            }.bind(this), 200);

            return emptyState;
        },
        updateSettings: function (settings) {
            settings = _.defaults(settings, this.state.settings);
            dataHandler.set('settings', settings);
            this.setState({settings: settings});
        },
        render: template
    });
});
