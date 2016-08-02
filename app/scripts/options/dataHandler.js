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
		settings: {
      additionalQueryParams: '',
			disableLeavePagePopUp: false,
			disableNewRelic: true,
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
		this.updateLatestVersions();
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

	Handler.prototype.updateLatestVersions = function updateLatestVersions() {
		var editorRcs = $.get('http://rudolph.wixpress.com/services/availableRcs?project=santa-editor');
		var editorGA = $.get('http://rudolph.wixpress.com/services/versionsProjectGa?project=santa-editor');
		var santaGA = $.get('http://rudolph.wixpress.com/services/versionsProjectGa?project=santa-viewer');
		var santaRcs = $.get('http://rudolph.wixpress.com/services/availableRcs?project=santa-viewer');
		return Promise.all([editorRcs, editorGA, santaRcs, santaGA])
			.then(function (responses) {
				var editorVersions = ['none', 'local', 'Latest RC'].concat(_(responses[0].result).reverse().value());
				this.EditorSource = {
					version: localStore.EditorSource.version || responses[1].result || 'none',
					versions: editorVersions
				};

				var santaVersions = ['none', 'local', 'Latest RC'].concat(_(responses[2].result).reverse().value());
				this.ReactSource = {
					version: localStore.ReactSource.version || responses[3].result || 'none',
					versions: santaVersions
				};
			}.bind(this));
	};

	Handler.prototype.updateFeaturePresets = function updateFeaturePresets() {
		var id = '1Z-QLMn-xyesvLIuU_suoJXVnTizCTx7dkbY2hGFdSLk';
		return googleSpreadsheet.getAsJson(id);
	};

	return new Handler();
});
