'use strict';
(function () {
    if (!window.require) {
        return;
    }

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

            if (typeof string === 'string' && string.length > 0) {
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
            var sameDomainFrames = _.filter(_.toArray(frames), function (frame) {
                try {
                    return frame.document;
                } catch (e) {
                    return false;
                }
            });

            var reactComps = _([window].concat(sameDomainFrames))
                .map(function (win) {
                    return _(win)
                        .values()
                        .compact()
                        .filter(function (comp) {
                            return comp !== window.selectedComponent && React.addons.TestUtils.isCompositeComponent(comp);
                        })
                        .value();
                })
                .flatten()
                .value();

            return _.reduce(reactComps, function (acc, comp) {
                var components = React.addons.TestUtils.findAllInRenderedTree(comp, predicate);
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
            var reactId = comp.getDOMNode().attributes['data-reactid'];
            return comp.props.id || (reactId && reactId.value);
        }

        var components, hoveredComponent;

        var events = {
            getComponents: function () {
                components = _(getComponentsByName('')).filter(function (comp) {
                    return comp.isMounted() && comp.getDOMNode();
                }).transform(function (acc, comp) {
                    acc[getId(comp)] = comp;
                }, {}).value();

                return _.transform(components, function (acc, comp, id) {
                    acc.push({
                        name: comp.constructor.displayName,
                        id: id,
                        domId: comp.getDOMNode().id
                    });
                }, []);
            },
            markComponent: function (id) {
                if (hoveredComponent && hoveredComponent.isMounted()) {
                    var selectedNode = hoveredComponent.getDOMNode();
                    if (selectedNode) {
                        selectedNode.style.outline = '';
                    }
                }

                if (_.has(components, id)) {
                    var component = components[id];
                    hoveredComponent = component;
                    var domNode = component.getDOMNode();
                    domNode.style.outline = '#F00 dashed 3px';
                    //domNode.style.backgroundColor = ''
                    domNode.scrollIntoView();
                    var defaultView = domNode.ownerDocument.defaultView;
                    defaultView.scrollBy(0, -50);
                    window.parent.scrollTo(defaultView.pageXOffset, defaultView.pageYOffset);
                }
            },
            selectComponent: function (id) {
                var comp = window.selectedComponent = components[id];

                var result = _.pick(comp, ['props', 'state', 'proxyData', 'contextPath']);
                result.partData = comp.getDataByFullPath && comp.getDataByFullPath(comp.getRootDataItemRef());
                return JSON.parse(JSON.prune(compactObject(result)));
            }
        };

        document.addEventListener('Editor_Command', function (evt) {
            var result = events[evt.detail.type](evt.detail.params);
            if (result) {
                document.dispatchEvent(new CustomEvent('Editor_Response', {detail: result}));
            }
        });
    });
}());