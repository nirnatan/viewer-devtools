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
        return React.createElement('div', { 'id': 'main' }, React.createElement(baseUI.ButtonToolbar, {}, !this.state.optionsSet ? React.createElement(baseUI.Button, {
            'bsStyle': 'success',
            'onClick': this.redirectUrl,
            'key': 'enableBtn'
        }, 'Apply options') : null, !this.state.isEditor ? React.createElement(baseUI.Button, {
            'bsStyle': 'success',
            'onClick': this.openEditor,
            'key': 'openEditorBtn'
        }, 'Open Editor') : null), React.createElement(baseUI.Input, {
            'className': _.keys(_.pick({
                'search-box': true,
                'only-search': this.state.active
            }, _.identity)).join(' '),
            'autoFocus': true,
            'disabled': !this.state.active,
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