define([
    'react/addons',
    'lodash',
    'react-bootstrap',
    'popup/component',
    'popup/switchMode',
    'options/components/versionSelector'
], function (React, _, baseUI, Component, switchMode, versionSelector) {
    'use strict';
    function onClick1(Utils, isWixSite) {
        Utils.moveToPage(this.state.locations.previewUrl);
    }
    function onClick2(Utils, isWixSite) {
        Utils.moveToPage(this.state.locations.publicUrl);
    }
    function onSelectionChanged3(Utils, isWixSite, comp, compIndex, selectedComp) {
        this.setState({ selectedComp: selectedComp });
    }
    function repeatComp4(Utils, isWixSite, comp, compIndex) {
        return React.createElement(Component, {
            'className': 'component-wrapper',
            'selectedComp': this.state.selectedComp,
            'onSelectionChanged': onSelectionChanged3.bind(this, Utils, isWixSite, comp, compIndex),
            'comp': comp,
            'key': comp.id
        });
    }
    function scopeUtilsIsWixSite5() {
        var Utils = chrome.extension.getBackgroundPage().Utils;
        var isWixSite = this.state.isEditor || this.state.isViewer || this.state.isPreview;
        return React.createElement('div', { 'id': 'main' }, isWixSite ? React.createElement('div', { 'className': 'wix-site' }, React.createElement(baseUI.ButtonToolbar, {}, this.state.isImpersonationMode ? React.createElement(baseUI.Button, {
            'className': 'impersonate',
            'bsStyle': 'warning',
            'onClick': this.logBackIn
        }, React.createElement('img', {
            'src': chrome.extension.getURL('images/impersonate.png'),
            'alt': 'Log In'
        })) : null, !this.state.optionsSet ? React.createElement(baseUI.Button, {
            'bsStyle': 'success',
            'onClick': this.redirectUrl,
            'key': 'enableBtn'
        }, 'Apply options') : null, !this.state.isEditor ? React.createElement(baseUI.Button, {
            'bsStyle': 'success',
            'onClick': this.openEditor,
            'key': 'openEditorBtn'
        }, 'Open Editor') : null, this.state.locations.previewUrl ? React.createElement(baseUI.Button, {
            'bsStyle': 'success',
            'onClick': onClick1.bind(this, Utils, isWixSite),
            'key': 'previewBtn'
        }, 'Preview') : null, this.state.locations.publicUrl ? React.createElement(baseUI.Button, {
            'bsStyle': 'success',
            'onClick': onClick2.bind(this, Utils, isWixSite),
            'key': 'publicBtn'
        }, 'Public') : null, !this.state.isEditor ? React.createElement(switchMode, { 'key': 'switchMode' }) : null, React.createElement('img', {
            'src': chrome.extension.getURL('images/setting.png'),
            'title': 'Settings',
            'onClick': this.openSettings
        })), this.state.showVersionSelector ? React.createElement('div', { 'key': 'versionSelector' }, React.createElement('div', { 'className': 'version-selector' }, this.state.ReactSource.versions ? React.createElement(versionSelector, {
            'key': 'ReactSource.versions',
            'label': 'Santa Viewer',
            'currentVersion': this.initialVersions.ReactSource,
            'selectedVersion': this.state.ReactSource.version,
            'versions': this.state.ReactSource.versions,
            'updateSource': this.updateVersions.bind(this, 'ReactSource')
        }) : null, this.state.EditorSource.versions ? React.createElement(versionSelector, {
            'key': 'EditorSource.versions',
            'label': 'Santa Editor',
            'currentVersion': this.initialVersions.EditorSource,
            'selectedVersion': this.state.EditorSource.version,
            'versions': this.state.EditorSource.versions,
            'updateSource': this.updateVersions.bind(this, 'EditorSource')
        }) : null), this.state.updateFailed ? React.createElement('div', {
            'className': 'error-msg',
            'key': 'errorMsg'
        }, '\n                In order to get the latest versions list please connect to VPN\n                and login to ', React.createElement('a', {
            'href': 'http://rudolph.wixpress.com/',
            'target': '_blank'
        }, 'rudolph')) : null) : null, this.state.showComponents ? React.createElement('div', { 'key': 'components' }, React.createElement(baseUI.Input, {
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
            _.map(this.getComponents(), repeatComp4.bind(this, Utils, isWixSite))
        ]) : null, this.state.loading ? React.createElement('div', {
            'className': 'loading',
            'key': 'loading'
        }, React.createElement('div', {
            'className': 'bubblingG',
            'key': 'loadingAnim'
        }, React.createElement('span', {}), React.createElement('span', {}), React.createElement('span', {}))) : null) : null) : null, !isWixSite ? React.createElement('div', { 'className': 'no-wix-site' }, React.createElement('img', {
            'src': chrome.extension.getURL('images/nothing_to_do.gif'),
            'title': 'Settings'
        }), React.createElement('span', {}, 'I can\'t help you, this is not a wix site')) : null);
    }
    return function () {
        return scopeUtilsIsWixSite5.apply(this, []);
    };
});