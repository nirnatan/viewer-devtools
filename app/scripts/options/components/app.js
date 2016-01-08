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
                packages: {},
                ReactSource: {},
                EditorSource: {},
                updateFailed: false
            };

            setTimeout(function () {
                this.setState({
                    experiments: dataHandler.experiments.get(),
                    packages: dataHandler.packages.get(),
                    ReactSource: dataHandler.ReactSource.get(),
                    EditorSource: dataHandler.EditorSource.get()
                });
            }.bind(this), 100);

            return emptyState;
        },
        componentDidMount: function () {
            dataHandler.updateLatestVersions()
                .then(this.onVersionsUpdated)
                .catch(function () {
                    this.setState({updateFailed: true});
                }.bind(this));
        },
        onVersionsUpdated: function () {
            var state = _.pick(this.state, ['ReactSource', 'EditorSource']);
            state.ReactSource.versions = dataHandler.ReactSource.get().versions;
            state.EditorSource.versions = dataHandler.EditorSource.get().versions;
            this.setState(state);
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
