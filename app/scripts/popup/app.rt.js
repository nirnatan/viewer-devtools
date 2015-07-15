define([
    'react',
    'lodash',
    'popup/component'
], function (React, _, Component) {
    'use strict';
    function onChange1(comps) {
        this.props.onRedirectChange(!this.props.autoRedirect);
    }
    function repeatComp2(comps, comp, compIndex) {
        return React.createElement(Component, {
            'className': 'component-wrapper',
            'comp': comp,
            'key': comp.id
        });
    }
    function scopeComps3(comps) {
        return React.createElement('div', { 'id': 'main' }, React.createElement('div', { 'className': 'search-container' }, React.createElement('div', {}, React.createElement('span', {}, 'Enable'), React.createElement('input', {
            'type': 'checkbox',
            'checked': this.props.autoRedirect,
            'onChange': onChange1.bind(this, comps)
        }), !this.props.autoRedirect && _.isEmpty(comps) ? React.createElement('span', {
            'className': 'warning',
            'key': 'debug-message'
        }, 'Make sure you are in debug mode') : null), React.createElement('div', { 'className': 'search' }, React.createElement('input', {
            'autoFocus': true,
            'type': 'text',
            'valueLink': this.linkState('displayName')
        }))), React.createElement.apply(this, [
            'div',
            {
                'className': _.keys(_.pick({
                    'component-container': true,
                    loading: this.state.loading
                }, _.identity)).join(' ')
            },
            this.state.loading ? React.createElement('div', {
                'className': 'bubblingG',
                'key': 'loadingAnim'
            }, React.createElement('span', {}), React.createElement('span', {}), React.createElement('span', {})) : null,
            !this.state.loading ? _.map(comps, repeatComp2.bind(this, comps)) : null
        ]));
    }
    return function () {
        return scopeComps3.apply(this, [this.getComponents()]);
    };
});