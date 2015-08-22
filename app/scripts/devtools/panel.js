(function () {
    'use strict';

    var sidePanel;
    chrome.devtools.panels.elements.createSidebarPane('Component Props',
        function (sidebarPane) {
            sidePanel = sidebarPane;
        }
    );

    function inspectElement(props) {
        chrome.devtools.inspectedWindow.eval('inspect(selectedComponent.getDOMNode())'); // eslint-disable-line no-eval
        sidePanel.setObject(props);
    }

    var port = chrome.runtime.connect({name: 'devtools'});
    port.onMessage.addListener(function (msg) {
        switch (msg.type) {
            case 'inspectElement':
                inspectElement(msg.props);
                break;
        }
    });
}());