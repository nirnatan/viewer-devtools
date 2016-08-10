define(['react', 'react-dom', 'lodash', 'dataHandler', './app.rt'], function (React, ReactDOM, _, dataHandler, template) {
	'use strict';

	function updateData(name, newValue) {
		var value = _.assign({}, this.state[name], newValue);
		dataHandler.set(name, value);

		var state = {};
		state[name] = value;
		this.setState(state);
	}

	function updateExperimentIfExists(groupName, expName, newState) {
		if (_.has(this.state[groupName], expName)) {
			ga('send', 'event', 'Options', 'Experiment ' + expName, newState);
			var value = {};
			value[expName] = newState || !this.state[groupName][expName];
			updateData.call(this, groupName, value);
			return true;
		}

		return false;
	}

	function updatedExperiments(experiments) {
		return new Promise(callback => {
			var remainingExperiments = _.clone(experiments);
			var groups = ['santaExperiments', 'editorExperiments'];
			var currentState = _.clone(this.state);
			var newState = _.transform(groups, function (acc, groupName) {
				var group = currentState[groupName];
				var experimentsInGroup = _.pick(experiments, _.keys(group));

				remainingExperiments = _.omit(remainingExperiments, _.keys(experimentsInGroup));

				acc[groupName] = _.assign(group, experimentsInGroup);
				dataHandler.set(groupName, acc[groupName]);
			}, {});

			if (!_.isEmpty(remainingExperiments)) {
				remainingExperiments = _.keys(remainingExperiments);
				newState.customExperiments = this.state.customExperiments ? _(this.state.customExperiments.split(',').concat(remainingExperiments)).map(_.trim).uniq().join(', ') : remainingExperiments;
				dataHandler.set('custom', {experiments: newState.customExperiments});
			}

			this.setState(newState, callback);
		});
	}

	function mergeExperiments() {
		var custom = dataHandler.custom;
		var santaExperiments = dataHandler.santaExperiments;
		var editorExperiments = dataHandler.editorExperiments;

		if (_.get(custom, 'experiments')) {
			const customExperiments = _.isArray(custom.experiments) ? custom.experiments : custom.experiments.split(',');
			var exps = _.map(customExperiments, _.trim);
			var allExperimentsNames = _(santaExperiments).union(editorExperiments).keys().value();
			var intersection = _.intersection(exps, allExperimentsNames);
			if (!_.isEmpty(intersection)) {
				exps = _.reject(exps, exp => _.has(intersection, exp));
				dataHandler.set('custom', {experiments: exps.join(', ')});

				_.forEach(intersection, function (exp) {
					if (_.has(santaExperiments, exp)) {
						santaExperiments[exp] = true;
					}
					if (_.has(editorExperiments, exp)) {
						editorExperiments[exp] = true;
					}
				});

				dataHandler.set('santaExperiments', santaExperiments);
				dataHandler.set('editorExperiments', editorExperiments);
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
				features: [],
				settings: {},
				modifiedPackages: []
			};

			setTimeout(() => {
				mergeExperiments();
				var custom = dataHandler.custom;
				var features = dataHandler.features;
				const customExperiments = _.isArray(custom.experiments) ? custom.experiments : custom.experiments.split(',');
				this.setState({
					customExperiments: _(customExperiments).map(_.trim).uniq().join(', '),
					santaExperiments: dataHandler.santaExperiments,
					editorExperiments: dataHandler.editorExperiments,
					packages: dataHandler.packages,
					ReactSource: dataHandler.ReactSource,
					EditorSource: dataHandler.EditorSource,
					settings: dataHandler.settings,
					modifiedPackages: dataHandler.modifiedPackages,
					features: features
				});

				if (_.isEmpty(features)) {
					dataHandler.updateFeaturePresets()
						.then(featurePresets => {
							this.setState({features: featurePresets});
						});
				}
			}, 100);

			return emptyState;
		},
		componentDidMount: function () {
			dataHandler.update()
				.then(this.onVersionsUpdated)
				.catch(() => {
					this.setState({updateFailed: true});
				});
		},
		onVersionsUpdated: function () {
			var state = _.pick(this.state, ['ReactSource', 'EditorSource']);
			state.ReactSource.versions = dataHandler.ReactSource.versions;
			state.EditorSource.versions = dataHandler.EditorSource.versions;
			this.setState(state);
		},
		onExperimentChanged: function (name) {
			updateExperimentIfExists.call(this, 'santaExperiments', name);
			updateExperimentIfExists.call(this, 'editorExperiments', name);
		},
		onUserExperimentsChanged: function (e) {
			var experiments = e.target.value;
			dataHandler.set('custom', {experiments: experiments});
			ga('send', 'event', 'Options', 'Custom experiments Set');

			this.setState({
				customExperiments: experiments
			});
		},
		onPackageChanged: function (name) {
			var value = {};
			value[name] = !this.state.packages[name];
			ga('send', 'event', 'Options', 'Package ' + name, value[name]);
			updateData.call(this, 'packages', value);
		},
		updateReactSource: function (newValue) {
			ga('send', 'event', 'Options', 'ReactSource', newValue);
			updateData.call(this, 'ReactSource', newValue);
		},
		updateEditorSource: function (newValue) {
			ga('send', 'event', 'Options', 'EditorSource', newValue);
			updateData.call(this, 'EditorSource', newValue);
		},
		applyFeature: function () {
			var selectedFeature = ReactDOM.findDOMNode(this.refs.feature).firstChild.value;
			if (selectedFeature === 'none') {
				return;
			}
			ga('send', 'event', 'Options', 'Apply Feature ' + selectedFeature);
			var feature = _.find(this.state.features, {Feature: selectedFeature});

			var experiments = _(feature.experiments.split(',')).indexBy().mapValues(Boolean).value();
			updatedExperiments.call(this, experiments)
				.then(function () {
					if (dataHandler.settings.applyFeatureVersions) {
						feature.ReactSource && this.updateReactSource({version: feature.ReactSource});
						feature.EditorSource && this.updateEditorSource({version: feature.EditorSource});
					}
				});
		},
		resetSettings: function () {
			Promise.all([chrome.extension.getBackgroundPage().Utils.reset(), dataHandler.reset()])
					.then(() => location.reload());
		},
		selectAll: function (type) {
			var current = _.all(this.state[type]);
			var value = _.mapValues(this.state[type], function () {
				return !current;
			});
			dataHandler.set(type, value);

			var state = {};
			state[type] = value;
			this.setState(state);
		},
		debugModifiedPackages() {
			const {settings: {debugModifiedPackages}} = this.state;
			const newSettings = _.defaults({debugModifiedPackages: !debugModifiedPackages}, this.state);

			dataHandler.set('settings', newSettings);
			this.setState({settings: newSettings});
		},
		setModifiedPackages() {
			dataHandler.updateModifiedPackages()
				.then(() => {
					const packages = _.mapValues(this.state.packages, () => false);
					dataHandler.modifiedPackages.forEach(packageName => {
						packages[packageName] = true;
					});

					this.setState({packages: packages});
					dataHandler.set('packages', packages);
				});
		},
		render: template
	});
});
