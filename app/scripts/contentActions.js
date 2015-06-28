'use strict';
(function () {
    if (!window.require) {
        return;
    }

    var events, eventsQueue = [];

    require(['react', 'lodash'], function (React, _) {
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

        function getCompProps(comp) {
            var result = _.pick(comp, ['props', 'state', 'proxyData', 'contextPath']);
            result.partData = comp.getDataByFullPath && comp.getDataByFullPath(comp.getRootDataItemRef());
            var props = JSON.parse(JSON.prune(compactObject(result)));
            return props;
        }

        events = {
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
                        domId: comp.getDOMNode().id,
                        compProps: getCompProps(comp)
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
                return getCompProps(comp);
            },
            isDebuggable: function () {
                return _.has(React.addons, 'TestUtils');
            },
            setState: function (params) {
                if (_.has(components, params.id)) {
                    components[params.id].setState(params.state);
                }
            }
        };

        _.each(eventsQueue, handleEvent);
        eventsQueue = [];
    });

    function handleEvent(evt) {
        if (!events) {
            eventsQueue.push(evt);
            return;
        }

        var result = events[evt.detail.type](evt.detail.params);
        if (result !== undefined) {
            document.dispatchEvent(new CustomEvent('Editor_Response', {detail: result}));
        }
    }

    document.addEventListener('Editor_Command', handleEvent);
    document.dispatchEvent(new CustomEvent('scriptReady'));
}());