chrome.devtools.panels.elements.createSidebarPane("Component Props",
    function(sidebarPane) {
        function inspectElement(id) {
            if (sidebarPane) {
                sidebarPane.setExpression('inspect(document.getElementById("' + id + '"))');
            }
        }

        var port = chrome.runtime.connect({name: 'devtools'});
        port.onMessage.addListener(function (msg) {
            switch (msg.type) {
                case 'inspectElement':
                    inspectElement(msg.id);
                    break;
            }
        });
    }
);

