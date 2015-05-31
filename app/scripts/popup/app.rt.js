define([
    'react',
    'lodash',
    'popup/component'
], function (React, _, Component) {
    'use strict';
    function repeatComp1(comp, compIndex) {
        return React.createElement(Component, {
            'className': 'component-wrapper',
            'comp': comp,
            'key': comp.id
        });
    }
    return function () {
        return React.createElement('div', { 'id': 'main' }, React.createElement('label', { 'className': 'search' }, React.createElement('input', {
            'autoFocus': true,
            'type': 'text',
            'valueLink': this.linkState('displayName'),
            'onKeyPress': this.handleClick
        })    /* <button onClick="() => this.props.fire('search', this.state.displayName, this.handleSearchResults)">Search</button> */), React.createElement.apply(this, [
            'div',
            { 'className': 'component-container' },
            _.map(this.getComponents(), repeatComp1.bind(this))
        ]));
    };
});