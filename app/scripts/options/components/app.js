define(['react', 'react-dom', 'lodash', 'dataHandler', './app.rt'], function (React, ReactDOM, _, dataHandler, template) {
    'use strict';

    function updateData(name, newValue) {
        var value = _.assign({}, this.state[name], newValue);
        dataHandler[name].set(value);

        var state = {};
        state[name] = value;
        this.setState(state);
    }

    function updateExperimentIfExists(groupName, expName, newState) {
        if (_.has(this.state[groupName], expName)) {
            var value = {};
            value[expName] = newState || !this.state[groupName][expName];
            updateData.call(this, groupName, value);
            return true;
        }

        return false;
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
                exps = _.reject(exps, _.has.bind(_, intersection));
                dataHandler.custom.set({experiments: exps.join(', ')});

                _.forEach(intersection, function (exp) {
                    if (_.has(santaExperiments, exp)) {
                        santaExperiments[exp] = true;
                    }
                    if (_.has(editorExperiments, exp)) {
                        editorExperiments[exp] = true;
                    }
                });

                dataHandler.santaExperiments.set(santaExperiments);
                dataHandler.editorExperiments.set(editorExperiments);
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
                updateFailed: false,
                features: []
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
                    EditorSource: dataHandler.EditorSource.get(),
                    features: dataHandler.features.get()
                });
            }.bind(this), 1000);

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
        applyFeature: function () {
            var selectedFeature = ReactDOM.findDOMNode(this.refs.feature).firstChild.value;
            if (selectedFeature === 'none') {
                return;
            }
            var feature = _.find(this.state.features, {Feature: selectedFeature});
            var experiments = feature.experiments.split(',');
            _.each(experiments, function (exp) {
                var name = exp.trim();
                var found = updateExperimentIfExists.call(this, 'santaExperiments', name, true);
                found = updateExperimentIfExists.call(this, 'editorExperiments', name, true) || found;
                if (!found) {
                    var customExperiments = this.state.customExperiments ? _(this.state.customExperiments.split(',').concat(name)).map(_.trim).uniq().join(', ') : name;
                    dataHandler.custom.set({experiments: customExperiments});
                    this.setState({
                        customExperiments: customExperiments
                    });
                }
            }, this);

            if (dataHandler.settings.get().applyFeatureVersions) {
                feature.ReactSource && this.updateReactSource({version: feature.ReactSource});
                feature.EditorSource && this.updateEditorSource({version: feature.EditorSource});
            }
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
