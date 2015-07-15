define(['react', 'lodash', 'dataHandler', './app.rt'], function (React, _, dataHandler, template) {
    'use strict';

    function updateData(name, newValue) {
        var value = _.assign({}, this.state[name], newValue);
        dataHandler[name].set(value);

        var state = {};
        state[name] = value;
        this.setState(state);
    }

    return React.createClass({
        displayName: 'options',
        getInitialState: function () {
            var emptyState = {
                experiments: {},
                settings: {},
                packages: {},
                ReactSource: {},
                EditorSource: {}
            };

            setTimeout(function () {
                this.setState({
                    experiments: dataHandler.experiments.get(),
                    settings: dataHandler.settings.get(),
                    packages: dataHandler.packages.get(),
                    ReactSource: dataHandler.ReactSource.get(),
                    EditorSource: dataHandler.EditorSource.get()
                });
            }.bind(this), 100);

            return emptyState;
        },
        updateSettings: function (settings) {
            updateData.call(this, 'settings', settings);
        },
        onExperimentChanged: function (name) {
            var value = {};
            value[name] = !this.state.experiments[name];
            updateData.call(this, 'experiments', value);
        },
        onPackageChanged: function (name) {
            var value = {};
            value[name] = !this.state.packages[name];
            updateData.call(this, 'packages', value);
        },
        updateReactSource: function (newValue) {
            updateData.call(this, 'ReactSource', newValue);
        },
        updateEditorSource: function (newValue) {
            updateData.call(this, 'EditorSource', newValue);
        },
        updateVersions: function () {
            dataHandler.updateLatestVersions(function() {
                var state = _.pick(this.state, ['ReactSource', 'EditorSource']);
                state.ReactSource.version = dataHandler.ReactSource.get().version;
                state.EditorSource.version = dataHandler.EditorSource.get().version;
                this.setState(state);
            }.bind(this));
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
