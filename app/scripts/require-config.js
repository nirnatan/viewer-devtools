requirejs.config({
    'baseUrl': '/',
    'paths': {
        jquery: '/bower_components/jquery/dist/jquery.min',
        react: '/bower_components/react/react-with-addons',
        'react-dom': '/bower_components/react/react-dom',
        lodash: '/bower_components/lodash/lodash.min',
        'react-bootstrap': '/bower_components/react-bootstrap/react-bootstrap',
        jsoneditor: '/bower_components/jsoneditor/dist/jsoneditor',
        text: '/bower_components/requirejs-plugins/lib/text',
        json: '/bower_components/requirejs-plugins/src/json',
        dataHandler: '/scripts/options/dataHandler',
        generated: '/scripts/generated',
        options: '/scripts/options',
        popup: 'scripts/popup',
        utils: 'scripts/utils'
    },
    map: {
        '*': {
            'react/addons': 'react'
        }
    }
});
