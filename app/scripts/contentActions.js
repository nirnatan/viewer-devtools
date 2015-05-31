'use strict';

require(['react', 'lodash'], function (React, _) {
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


            var result = {
                props: comp.props,
                state: comp.state,
                partData: comp.getDataByFullPath && comp.getDataByFullPath(comp.getPartApi().getPartData()),
                proxyData: comp.proxyData,
                contextPath: comp.contextPath
            };
            return JSON.parse(JSON.prune(compactObject(result)));
            //return _.omit(window.selectedComponent.props, ['siteAPI', 'siteData', 'children', 'pageData', 'loadedStyles']);
        }
    };

    document.addEventListener('Editor_Command', function (evt) {
        var result = events[evt.detail.name](evt.detail.data);
        if (result) {
            document.dispatchEvent(new CustomEvent('Editor_Response', {detail: result}));
        }
    });
});