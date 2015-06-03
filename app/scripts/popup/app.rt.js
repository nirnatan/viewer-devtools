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
        return React.createElement.apply(this, [
            'div',
            { 'className': 'component-container' },
            _.isEmpty(comps) ? React.createElement('div', {}, 'Searching...') : null,
            _.map(comps, repeatComp1.bind(this, comps))
        ]);
    }
    return function () {
        return React.createElement('div', { 'id': 'main' }, React.createElement('label', { 'className': 'search' }, React.createElement('input', {
            'autoFocus': true,
            'type': 'text',
            'valueLink': this.linkState('displayName'),
            'onKeyPress': this.handleKeyPress
        })    /* <button onClick="() => this.props.fire('search', this.state.displayName, this.handleSearchResults)">Search</button> */), scopeComps2.apply(this, [this.getComponents()]));
    };
});