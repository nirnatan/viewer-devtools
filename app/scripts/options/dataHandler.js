define([
	'jquery',
	'lodash',
	'utils/google-spreadsheet',
	'utils/urlUtils',
	'json!generated/santa.json',
	'json!generated/santa-editor.json',
	'json!generated/packages.json'
], function ($, _, googleSpreadsheet, urlUtils, viewerExp, editorExp, packagesNames) {
	'use strict';

	var localStore = {
		santaExperiments: _(viewerExp)
			.zipObject()
			.mapValues(Boolean)
			.value(),
		editorExperiments: _(editorExp)
			.zipObject()
			.mapValues(Boolean)
			.value(),
		custom: {
			experiments: ''
		},
		packages: _(packagesNames)
			.zipObject()
			.mapValues(Boolean)
			.value(),
		modifiedPackages: [],
		settings: {
      additionalQueryParams: '',
			disableLeavePagePopUp: false,
			disableNewRelic: true,
			debugModifiedPackages: false,
			showComponents: false,
			versionSelectorInPopup: true,
			showPublicButton: true,
			showPreviewBtn: true,
			useWixCodeRuntimeSource: false,
			useWixCodeLocalSdk: false,
			applyFeatureVersions: false,
			username: ''
		},
		platform: {
			usePlatformOverrides: false,
			applicationId: '',
			port: '',
			viewer: '',
			editor: ''
		},
		ReactSource: {
			versions: [],
			version: ''
		},
		EditorSource: {
			versions: [],
			version: ''
		},
		features: []
	};

	chrome.storage.onChanged.addListener(function () {
		updateDataFromStorage();
	});

	function updateDataFromStorage() {
		return new Promise(function (resolve) {
			chrome.storage.local.get('settings', function (storage) {
				_.merge(localStore, storage.settings);
				resolve();
			});
		});
	}

	function Handler() {
		_.assign(this, localStore);

		Promise.all([updateDataFromStorage(), this.updateFeaturePresets()])
			.then(function (results) {
				this.isReady = true;
				this.features = results[1];
			}.bind(this));

		this.isReady = false;
		this.update();
	}

	Handler.prototype.reset = function reset() {
		return new Promise(function (resolve) {
			chrome.storage.local.set({settings: {}}, resolve);
		});
	};

	Handler.prototype.set = function set(path, value) {
		var current = _.get(this, path);
		_.set(this, path, _.defaultsDeep(value, current));

		var newSettings = {settings: JSON.parse(JSON.stringify(this))};
		return new Promise(function (resolve) {
			chrome.storage.local.set(newSettings, resolve);
		});
	};

	Handler.prototype.update = function update() {
		return new Promise(res => {
			let requestsDone = 0;
			const done = () => {
				requestsDone++;
				if (requestsDone === 5) {
					res();
				}
			};

			$.get('http://rudolph.wixpress.com/services/availableRcs?project=santa-editor').then(editorRcs => {
				this.EditorSource.versions = ['none', 'local', 'Latest RC'].concat(_(editorRcs.result).reverse().value());
				done();
			}, done);

			$.get('http://rudolph.wixpress.com/services/versionsProjectGa?project=santa-editor').then(editorGA => {
				this.EditorSource.version = localStore.EditorSource.version || editorGA.result || 'none';
				done();
			}, done);

			$.get('http://rudolph.wixpress.com/services/availableRcs?project=santa-viewer').then(santaRcs => {
				this.ReactSource.versions = ['none', 'local', 'Latest RC'].concat(_(santaRcs.result).reverse().value());
				done();
			}, done);

			$.get('http://rudolph.wixpress.com/services/versionsProjectGa?project=santa-viewer').then(santaGA => {
				this.ReactSource.version = localStore.ReactSource.version || santaGA.result || 'none';
				done();
			}, done);

			this.updateModifiedPackages().then(done);
		});
	};

	Handler.prototype.updateModifiedPackages = function updateModifiedPackages() {
		return new Promise((resolve) => {
			$.get('http://localhost/modifiedPackages').then(modifiedPackages => {
				this.modifiedPackages = modifiedPackages;
				resolve();
			}, () => resolve());
		});
	};

	Handler.prototype.updateFeaturePresets = function updateFeaturePresets() {
		var id = '1Z-QLMn-xyesvLIuU_suoJXVnTizCTx7dkbY2hGFdSLk';
		return googleSpreadsheet.getAsJson(id);
	};

	return new Handler();
});
