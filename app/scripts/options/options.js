requirejs(['react', 'react-dom', 'lodash', 'options/components/app'], function (React, ReactDOM, _, app) {
    'use strict';
    
    var appElement = React.createElement(app);
    ReactDOM.render(appElement, document.getElementById('root'));
});

