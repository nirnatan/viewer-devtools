define(['react', 'lodash', 'dataHandler', './app.rt'], function (React, _, dataHandler, template) {
    'use strict';

    return React.createClass({
        displayName: 'options',
        getInitialState: function () {
            if (dataHandler.isReady) {
                return {
                    experiments: dataHandler.experiments.get(),
                    settings: dataHandler.settings.get(),
                    packages: dataHandler.packages.get()
                };
            }

            var emptyState = {
                experiments: {},
                settings: {},
                packages: {}
            };

            setTimeout(function () {
                this.setState({
                    experiments: dataHandler.experiments.get(),
                    settings: dataHandler.settings.get(),
                    packages: dataHandler.packages.get()
                });
            }.bind(this), 100);

            return emptyState;
        },
        updateSettings: function (settings) {
            var newState = _.assign({}, this.state.settings, settings);
            dataHandler.settings.set(newState);
            this.setState(newState);
        },
        onExperimentChanged: function (name) {
            var experiments = _.clone(this.state.experiments);
            experiments[name] = !experiments[name];
            dataHandler.experiments.set(experiments);
            this.setState({experiments: experiments});
        },
        onPackageChanged: function (name) {
            var packages = _.clone(this.state.packages);
            packages[name] = !packages[name];
            dataHandler.packages.set(packages);
            this.setState({packages: packages});
        },
        selectAll: function (type) {
            var current = _.all(this.state[type]);
            var value = _.mapValues(this.state[type], function () {
                return !current;
            });
            dataHandler[type].set(value);

            var state = {};
            state[type] = value;
            this.setState(state);
        },
        render: template
    });
});
