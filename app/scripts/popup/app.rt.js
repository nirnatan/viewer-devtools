define([
    'react',
    'lodash',
    'popup/component'
], function (React, _, Component) {
    'use strict';
    function repeatComp1(comps, comp, compIndex) {
        return React.createElement(Component, {
            'className': 'component-wrapper',
            'comp': comp,
            'key': comp.id
        });
    }
    function scopeComps2(comps) {
        return React.createElement('div', { 'id': 'main' }, React.createElement('div', { 'className': 'search-container' }, React.createElement('div', { 'className': 'search' }, React.createElement('input', {
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
            !this.state.loading ? _.map(comps, repeatComp1.bind(this, comps)) : null
        ]));
    }
    return function () {
        return scopeComps2.apply(this, [this.getComponents()]);
    };
});