define(['react', 'dataHandler', './platform.rt'], function (React, dataHandler, template) {
	'use strict';

	return React.createClass({
		displayName: 'settings',
		getInitialState: function () {
			var emptyState = {
				platform: {
					viewer: {},
					editor: {},
					usePlatformOverrides: false
				},
				settings: {
					useWixCodeLocalSdk: false
				}
			};

			setTimeout(() => this.setState({platform: dataHandler.platform, settings: dataHandler.settings}), 200);

			return emptyState;
		},

		updateViewer(viewer) {
			const platform = _.defaults({viewer}, this.state.platform);
			dataHandler.set('platform', platform);
			this.setState({platform: platform});
		},
		updateEditor(editor) {
			const platform = _.defaults({editor}, this.state.platform);
			dataHandler.set('platform', platform);
			this.setState({platform: platform});
		},
		updateUsePlatformOverrides() {
			const usePlatformOverrides = !this.state.platform.usePlatformOverrides;
			const platform = _.defaults({usePlatformOverrides}, this.state.platform);
			dataHandler.set('platform', platform);
			this.setState({platform: platform});
		},
		updateApplicationId(applicationId) {
			const platform = _.defaults({applicationId}, this.state.platform);
			dataHandler.set('platform', platform);
			this.setState({platform: platform});
		},
		updatePort(port) {
			const platform = _.defaults({port}, this.state.platform);
			dataHandler.set('platform', platform);
			this.setState({platform: platform});
		},
		updateUseWixCodeLocalSdk() {
			const useWixCodeLocalSdk = !this.state.settings.useWixCodeLocalSdk;
			const settings = _.defaults({useWixCodeLocalSdk}, this.state.settings);
			dataHandler.set('settings', settings);
			this.setState({settings: settings});
		},
		render: template
	});
});
