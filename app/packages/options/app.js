define(['react', 'lodash', 'dataHandler', './app.rt'], function (React, _, dataHandler, template) {
    'use strict';

    return React.createClass({
        displayName: 'options',
        getInitialState: function () {
            Promise.all([dataHandler.getExperiments(), dataHandler.settings.get()])
                .then(function (state) {
                    this.setState({
                        experiments: state[0],
                        settings: state[1]
                    });
                }.bind(this));

            return {
                experiments: [],
                settings: {}
            };
        },
        updateSettings: function (settings) {
            var newState = _.defaults(settings, this.state.settings);
            dataHandler.settings.set(newState);
            this.setState(newState);
        },
        onExperimentChanged: function (name, enabled) {
            enabled = !!enabled;
            dataHandler.toggleExperiment(name, enabled)
                .then(function () {
                    var experiments = _.clone(this.state.experiments);
                    experiments[name] = enabled;
                    this.setState({experiments: experiments});
                }.bind(this));
        },
        render: template
    });
});
