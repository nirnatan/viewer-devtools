define(['react', 'lodash', 'dataHandler', './app.rt'], function (React, _, dataHandler, template) {
    'use strict';

    function updateData(name, newValue) {
        var value = _.assign({}, this.state[name], newValue);
        dataHandler[name].set(value);

        var state = {};
        state[name] = value;
        this.setState(state);
    }

    function updateExperimentIfExists(groupName, expName) {
        if (_.has(this.state[groupName], expName)) {
            var value = {};
            value[expName] = !this.state[groupName][expName];
            updateData.call(this, groupName, value);
        }
    }
    
    function mergeExperiments() {
        var custom = dataHandler.custom.get();
        var santaExperiments = dataHandler.santaExperiments.get();
        var editorExperiments = dataHandler.editorExperiments.get();

        if (_.get(custom, 'experiments')) {
            var exps = _.map(custom.experiments.split(','), _.trim);
            var allExperimentsNames = _(santaExperiments).union(editorExperiments).keys().value();
            var intersection = _.intersection(exps, allExperimentsNames);
            if (!_.isEmpty(intersection)) {
                exps = _.reject(exps, _.has.bind(_, experiments));
                dataHandler.custom.set({experiments: exps.join(', ')});

                _.forEach(intersection, function (exp) {
                    if (_.has(santaExperiments, exp)) {
                        santaExperiments[exp] = true;
                    }
                    if (_.has(editorExperiments, exp)) {
                        editorExperiments[exp] = true;
                    }
                });

                dataHandler.santaExperiments.set(experiments);
                dataHandler.editorExperiments.set(experiments);
            }
        }
    }

    return React.createClass({
        displayName: 'options',
        getInitialState: function () {
            var emptyState = {
                santaExperiments: {},
                editorExperiments: {},
                customExperiments: '',
                packages: {},
                ReactSource: {},
                EditorSource: {},
                updateFailed: false
            };

            setTimeout(function () {
                mergeExperiments();
                var custom = dataHandler.custom.get();
                this.setState({
                    customExperiments: _(custom.experiments.split(',')).map(_.trim).uniq().join(', '),
                    santaExperiments: dataHandler.santaExperiments.get(),
                    editorExperiments: dataHandler.editorExperiments.get(),
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
            updateExperimentIfExists.call(this, 'santaExperiments', name);
            updateExperimentIfExists.call(this, 'editorExperiments', name);
        },
        onUserExperimentsChanged: function (e) {
            var value = e.target.value;
            dataHandler.custom.set({experiments: value});

            this.setState({
                customExperiments: value
            });
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
