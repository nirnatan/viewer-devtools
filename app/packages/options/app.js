define(['react', 'lodash', 'dataHandler', './app.rt'], function (React, _, dataHandler, template) {
    'use strict';

    return React.createClass({
        displayName: 'options',
        getInitialState: function () {
            Promise.all([dataHandler.getExperiments(), dataHandler.autoRedirect.get()])
                .then(function (state) {
                    this.setState({
                        experiments: state[0],
                        autoRedirect: state[1]
                    });
                }.bind(this));

            return {
                experiments: [],
                autoRedirect: false
            };
        },
        onRedirectChanged: function () {
            dataHandler.autoRedirect.set(!this.state.autoRedirect);
            this.setState({autoRedirect: !this.state.autoRedirect});
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
