define([
    'react',
    'lodash',
    'react-bootstrap',
    'popup/component'
], function (React, _, baseUI, Component) {
    'use strict';
    function onSelectionChanged1(comp, compIndex, selectedComp) {
        this.setState({ selectedComp: selectedComp });
    }
    function repeatComp2(comp, compIndex) {
        return React.createElement(Component, {
            'className': 'component-wrapper',
            'selectedComp': this.state.selectedComp,
            'onSelectionChanged': onSelectionChanged1.bind(this, comp, compIndex),
            'comp': comp,
            'key': comp.id
        });
    }
    return function () {
        return React.createElement('div', { 'id': 'main' }, React.createElement(baseUI.Button, {
            'bsStyle': 'success',
            'onClick': this.redirectUrl
        }, 'Debug this site'), React.createElement(baseUI.Input, {
            'autoFocus': true,
            'type': 'text',
            'valueLink': this.linkState('displayName')
        }), !this.state.loading ? React.createElement.apply(this, [
            'div',
            {
                'className': 'components',
                'key': 'components'
            },
            _.map(this.getComponents(), repeatComp2.bind(this))
        ]) : null, this.state.loading ? React.createElement('div', {
            'className': 'loading',
            'key': 'loading'
        }, React.createElement('div', {
            'className': 'bubblingG',
            'key': 'loadingAnim'
        }, React.createElement('span', {}), React.createElement('span', {}), React.createElement('span', {}))) : null);
    };
});