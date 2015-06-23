chrome.devtools.panels.elements.createSidebarPane("Component Props",
    function(sidebarPane) {

    }
);

function inspectElement(id) {
    chrome.devtools.inspectedWindow.eval('inspect(selectedComponent.getDOMNode())');
}

var port = chrome.runtime.connect({name: 'devtools'});
port.onMessage.addListener(function (msg) {
    switch (msg.type) {
        case 'inspectElement':
            inspectElement(msg.id);
            break;
    }
});

