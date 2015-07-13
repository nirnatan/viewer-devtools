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
            var reactFrames = _.filter(_.toArray(frames).concat(window), function (frame) {
                try {
                    return frame.__REACT_DEVTOOLS_GLOBAL_HOOK__._reactRuntime;
                } catch (e) {
                    return false;
                }
            });

            return _(reactFrames)
                .map(function (frame) {
                    return _.map(frame.__REACT_DEVTOOLS_GLOBAL_HOOK__._reactRuntime.Mount._instancesByReactRootID, function (root) {
                        return root.getPublicInstance ? root.getPublicInstance() : root;
                    });
                })
                .flatten()
                .reduce(function (acc, comp) {
                    var components = React.addons.TestUtils.findAllInRenderedTree(comp, predicate);
                    return components.length ? acc.concat(_.filter(components, 'getDOMNode')) : acc;
                }, []);
        }

        function getComponentsByName(displayName) {
            var regExp = new RegExp(displayName, 'ig');
            return getComponentBy(function (component) {
                var displayName = component.constructor.displayName;
                return regExp.test(displayName);
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
                    var displayName = comp.constructor.displayName;
                    return (displayName && displayName.indexOf('ReactDOM') !== 0) && !comp.tagName && comp.isMounted() && comp.getDOMNode();
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