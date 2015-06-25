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
        return React.createElement('div', { 'id': 'main' }, React.createElement('div', { 'className': 'search-container' }, React.createElement('div', {}, React.createElement('span', {}, 'Auto Redirect: '), React.createElement('input', {
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
            { 'className': 'component-container' },
            _.map(comps, repeatComp2.bind(this, comps))
        ]));
    }
    return function () {
        return scopeComps3.apply(this, [this.getComponents()]);
    };
});