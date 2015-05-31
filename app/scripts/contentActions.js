'use strict';
/*!
 * querystring - Simple querystring lib with no dependencies
 * v0.1.0
 * https://github.com/jgallen23/querystring
 * copyright Greg Allen 2013
 * MIT License
 */
var querystring = {
    parse: function (string) {
        var parsed = {};
        string = (string !== undefined) ? string : window.location.search;

        if (typeof string === "string" && string.length > 0) {
            if (string[0] === '?') {
                string = string.substring(1);
            }

            string = string.split('&');

            for (var i = 0, length = string.length; i < length; i++) {
                var element = string[i],
                    eqPos = element.indexOf('='),
                    keyValue, elValue;

                if (eqPos >= 0) {
                    keyValue = element.substr(0, eqPos);
                    elValue = element.substr(eqPos + 1);
                }
                else {
                    keyValue = element;
                    elValue = '';
                }

                elValue = decodeURIComponent(elValue);

                if (parsed[keyValue] === undefined) {
                    parsed[keyValue] = elValue;
                }
                else if (parsed[keyValue] instanceof Array) {
                    parsed[keyValue].push(elValue);
                }
                else {
                    parsed[keyValue] = [parsed[keyValue], elValue];
                }
            }
        }

        return parsed;
    },
    stringify: function (obj) {
        var string = [];

        if (!!obj && obj.constructor === Object) {
            for (var prop in obj) {
                if (obj[prop] instanceof Array) {
                    for (var i = 0, length = obj[prop].length; i < length; i++) {
                        string.push([encodeURIComponent(prop), encodeURIComponent(obj[prop][i])].join('='));
                    }
                }
                else {
                    string.push([encodeURIComponent(prop), encodeURIComponent(obj[prop])].join('='));
                }
            }
        }

        return string.join('&');
    }
};

require(['react', 'lodash'], function (React, _) {
    if (!_.has(React.addons, 'TestUtils')) {
        var params = querystring.parse(window.location.search);
        if (params.debug) {
            params.debug = _.isArray(params.debug) ? params.debug.push('react') : [params.debug, 'react'];
        } else {
            params.debug = 'react';
        }

        window.location.search = querystring.stringify(params);
    }
    function compactObject(obj) {
        return _.transform(obj, function (acc, value, key) {
            if (value) {
                acc[key] = value;
            }
        }, {});
    }

    function getComponentBy(predicate) {
        var windows = [window].concat(_.toArray(frames));
        return _.reduce(windows, function (acc, win) {
            var components = React.addons.TestUtils.findAllInRenderedTree(win.rendered, predicate);
            return components.length ? acc.concat(_.filter(components, 'getDOMNode')) : acc;
        }, []);

    }

    function getComponentsByName(displayName) {
        var regExp = new RegExp(displayName, 'ig');
        return getComponentBy(function (component) {
            var displayName = component.constructor.displayName;
            return displayName !== 'ReactDOMComponent' && regExp.test(displayName);
        });
    }

    function getId(comp) {
        var reactId = comp.getDOMNode() && comp.getDOMNode().attributes['data-reactid'];
        return comp.props.id || (reactId && reactId.value);
    }

    var components, hoveredComponent;

    var events = {
        search: function (term) {
            components = getComponentsByName(term);
            return _.map(components, function (comp) {
                return {
                    id: getId(comp),
                    name: comp.constructor.displayName
                };
            });
        },
        markComponent: function (id) {
            if (hoveredComponent && hoveredComponent.isMounted()) {
                var selectedNode = hoveredComponent.getDOMNode();
                if (selectedNode) {
                    selectedNode.style.border = '';
                }
            }

            var component = _.find(components, function (comp) {
                return getId(comp) === id;
            });

            if (component && component.isMounted()) {
                var domNode = component.getDOMNode();
                if (!domNode) {
                    return;
                }
                hoveredComponent = component;
                domNode.style.border = '#F00 dashed 1px';
                domNode.scrollIntoView();
                var defaultView = domNode.ownerDocument.defaultView;
                defaultView.scrollBy(0, -50);
                window.parent.scrollTo(defaultView.pageXOffset, defaultView.pageYOffset);
            }
        },
        selectComponent: function (id) {
            var comp = window.selectedComponent = _.find(components, function (comp) {
                return getId(comp) === id;
            });

            var result = _.pick(comp, ['props', 'state', 'proxyData', 'contextPath']);
            result.partData = comp.getDataByFullPath && comp.getDataByFullPath(comp.getRootDataItemRef());
            return JSON.parse(JSON.prune(compactObject(result)));
        }
    };

    document.addEventListener('Editor_Command', function (evt) {
        var result = events[evt.detail.name](evt.detail.data);
        if (result) {
            document.dispatchEvent(new CustomEvent('Editor_Response', {detail: result}));
        }
    });
});