define([
    'react',
    'lodash',
    'react-bootstrap',
    'popup/component',
    'popup/switchMode',
    'options/components/versionSelector'
], function (React, _, baseUI, Component, switchMode, versionSelector) {
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
        return React.createElement('div', { 'id': 'main' }, this.state.isEditor || this.state.isViewer ? React.createElement('div', { 'className': 'wix-site' }, React.createElement(baseUI.ButtonToolbar, {}, !this.state.optionsSet ? React.createElement(baseUI.Button, {
            'bsStyle': 'success',
            'onClick': this.redirectUrl,
            'key': 'enableBtn'
        }, 'Apply options') : null, !this.state.isEditor ? React.createElement(baseUI.Button, {
            'bsStyle': 'success',
            'onClick': this.openEditor,
            'key': 'openEditorBtn'
        }, 'Open Editor') : null, !this.state.isEditor ? React.createElement(switchMode, { 'key': 'switchMode' }) : null, React.createElement('img', {
            'src': chrome.extension.getURL('images/setting.png'),
            'title': 'Settings',
            'onClick': this.openSettings
        })), this.state.showVersionSelector ? React.createElement('div', {
            'className': 'version-selector',
            'key': 'versionSelector'
        }, this.state.ReactSource.versions ? React.createElement(versionSelector, {
            'key': 'ReactSource.versions',
            'label': 'Santa Viewer',
            'enabled': this.state.ReactSource.enabled,
            'selectedVersion': this.state.ReactSource.version,
            'versions': this.state.ReactSource.versions,
            'updateSource': this.updateVersions.bind(this, 'ReactSource')
        }) : null, this.state.EditorSource.versions ? React.createElement(versionSelector, {
            'key': 'EditorSource.versions',
            'label': 'Santa Editor',
            'enabled': this.state.EditorSource.enabled,
            'selectedVersion': this.state.EditorSource.version,
            'versions': this.state.EditorSource.versions,
            'updateSource': this.updateVersions.bind(this, 'EditorSource')
        }) : null) : null, this.state.showComponents ? React.createElement('div', { 'key': 'components' }, React.createElement(baseUI.Input, {
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
        }, React.createElement('span', {}), React.createElement('span', {}), React.createElement('span', {}))) : null) : null) : null, !this.state.isEditor && !this.state.isViewer ? React.createElement('div', { 'className': 'no-wix-site' }, React.createElement('img', {
            'src': chrome.extension.getURL('images/nothing_to_do.gif'),
            'title': 'Settings'
        }), React.createElement('span', {}, 'I can\'t help you, this is not a wix site')) : null);
    };
});