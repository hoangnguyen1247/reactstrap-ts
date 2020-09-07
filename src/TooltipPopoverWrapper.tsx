import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import PopperContent from './PopperContent';
import {
    getTarget,
    targetPropType,
    omit,
    PopperPlacements,
    mapToCssModules,
    DOMElement
} from './utils';

export const propTypes = {
    children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    placement: PropTypes.oneOf(PopperPlacements),
    target: targetPropType.isRequired,
    container: targetPropType,
    isOpen: PropTypes.bool,
    disabled: PropTypes.bool,
    hideArrow: PropTypes.bool,
    boundariesElement: PropTypes.oneOfType([PropTypes.string, DOMElement]),
    className: PropTypes.string,
    innerClassName: PropTypes.string,
    arrowClassName: PropTypes.string,
    popperClassName: PropTypes.string,
    cssModule: PropTypes.object,
    toggle: PropTypes.func,
    autohide: PropTypes.bool,
    placementPrefix: PropTypes.string,
    delay: PropTypes.oneOfType([
        PropTypes.shape({ show: PropTypes.number, hide: PropTypes.number }),
        PropTypes.number
    ]),
    modifiers: PropTypes.object,
    offset: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    innerRef: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.string,
        PropTypes.object
    ]),
    trigger: PropTypes.string,
    fade: PropTypes.bool,
    flip: PropTypes.bool,
};

const DEFAULT_DELAYS = {
    show: 0,
    hide: 50
};

const defaultProps = {
    isOpen: false,
    hideArrow: false,
    autohide: false,
    delay: DEFAULT_DELAYS,
    toggle: function () { },
    trigger: 'click',
    fade: true,
};

function isInDOMSubtree(element, subtreeRoot) {
    return subtreeRoot && (element === subtreeRoot || subtreeRoot.contains(element));
}

function isInDOMSubtrees(element, subtreeRoots = []) {
    return subtreeRoots && subtreeRoots.length && subtreeRoots.filter(subTreeRoot => isInDOMSubtree(element, subTreeRoot))[0];
}

function TooltipPopoverWrapper(props) {

    const _targets = useRef([]);
    const currentTargetElement = useRef(null);
    const _isMounted = useRef(false);
    const _popover = useRef(null);
    const _hideTimeout = useRef(undefined);
    const _showTimeout = useRef(undefined);

    const [ isOpen, setIsOpen ] = useState(props.isOpen)

    useEffect(() => {
        _isMounted.current = true;
        updateTarget();

        return (() => {
            _isMounted.current = false;
            removeTargetEvents();
            _targets.current = null;
            clearShowTimeout();
            clearHideTimeout();
        })
    }, [])

    useEffect(() => {
        if (props.isOpen && !isOpen) {
            setIsOpen(props.isOpen);
        } else setIsOpen(false);
    })

    const onMouseOverTooltipContent = () => {
        if (props.trigger.indexOf('hover') > -1 && !props.autohide) {
            if (_hideTimeout) {
                clearHideTimeout();
            }
            if (isOpen && !props.isOpen) {
                toggle({});
            }
        }
    }

    const onMouseLeaveTooltipContent = (e) => {
        if (props.trigger.indexOf('hover') > -1 && !props.autohide) {
            if (_showTimeout) {
                clearShowTimeout();
            }
            e.persist();
            _hideTimeout.current = setTimeout(
                hide,
                getDelay('hide')
            );
        }
    }

    const onEscKeyDown = (e) => {
        if (e.key === 'Escape') {
            hide(e);
        }
    }

    const getRef = (ref) => {
        const { innerRef } = props;
        if (innerRef) {
            if (typeof innerRef === 'function') {
                innerRef(ref);
            } else if (typeof innerRef === 'object') {
                innerRef.current = ref;
            }
        }
        _popover.current = ref;
    }

    const getDelay = (key) => {
        const { delay } = props;
        if (typeof delay === 'object') {
            return isNaN(delay[key]) ? DEFAULT_DELAYS[key] : delay[key];
        }
        return delay;
    }

    const show = (e) => {
        if (!props.isOpen) {
            clearShowTimeout();
            currentTargetElement.current = e ? e.currentTarget || e.target : null;
            if (e && e.composedPath && typeof e.composedPath === 'function') {
                const path = e.composedPath();
                currentTargetElement.current = path && path[0] || currentTargetElement.current;
            }
            toggle(e);
        }
    }

    const showWithDelay = (e) => {
        if (_hideTimeout.current) {
            clearHideTimeout();
        }
        _showTimeout.current = setTimeout(
            show,
            getDelay('show')
        );
    }

    const hide = (e) => {
        if (props.isOpen) {
            clearHideTimeout();
            currentTargetElement.current = null;
            toggle(e);
        }
    }

    const hideWithDelay = (e) => {
        if (_showTimeout.current) {
            clearShowTimeout();
        }
        _hideTimeout.current = setTimeout(
            hide,
            getDelay('hide')
        );
    }

    const clearShowTimeout = () => {
        clearTimeout(_showTimeout.current);
        _showTimeout.current = undefined;
    }

    const clearHideTimeout = () => {
        clearTimeout(_hideTimeout.current);
        _hideTimeout.current = undefined;
    }

    const handleDocumentClick = (e) => {
        const triggers = props.trigger.split(' ');

        if (triggers.indexOf('legacy') > -1 && (props.isOpen || isInDOMSubtrees(e.target, _targets.current))) {
            if (_hideTimeout.current) {
                clearHideTimeout();
            }
            if (props.isOpen && !isInDOMSubtree(e.target, _popover.current)) {
                hideWithDelay(e);
            } else if (!props.isOpen) {
                showWithDelay(e);
            }
        } else if (triggers.indexOf('click') > -1 && isInDOMSubtrees(e.target, _targets.current)) {
            if (_hideTimeout.current) {
                clearHideTimeout();
            }

            if (!props.isOpen) {
                showWithDelay(e);
            } else {
                hideWithDelay(e);
            }
        }
    }

    const addEventOnTargets = (type, handler, isBubble) => {
        _targets.current.forEach(target => {
            target.addEventListener(type, handler, isBubble);
        });
    }

    const removeEventOnTargets = (type, handler, isBubble) => {
        _targets.current.forEach(target => {
            target.removeEventListener(type, handler, isBubble);
        });
    }

    const addTargetEvents = () => {
        if (props.trigger) {
            let triggers = props.trigger.split(' ');
            if (triggers.indexOf('manual') === -1) {
                if (triggers.indexOf('click') > -1 || triggers.indexOf('legacy') > -1) {
                    document.addEventListener('click', handleDocumentClick, true);
                }

                if (_targets.current && _targets.current.length) {
                    if (triggers.indexOf('hover') > -1) {
                        addEventOnTargets(
                            'mouseover',
                            showWithDelay,
                            true
                        );
                        addEventOnTargets(
                            'mouseout',
                            hideWithDelay,
                            true
                        );
                    }
                    if (triggers.indexOf('focus') > -1) {
                        addEventOnTargets('focusin', show, true);
                        addEventOnTargets('focusout', hide, true);
                    }
                    addEventOnTargets('keydown', onEscKeyDown, true);
                }
            }
        }
    }

    const removeTargetEvents = () => {
        if (_targets.current) {
            removeEventOnTargets(
                'mouseover',
                showWithDelay,
                true
            );
            removeEventOnTargets(
                'mouseout',
                hideWithDelay,
                true
            );
            removeEventOnTargets('keydown', onEscKeyDown, true);
            removeEventOnTargets('focusin', show, true);
            removeEventOnTargets('focusout', hide, true);
        }

        document.removeEventListener('click', handleDocumentClick, true)
    }

    const updateTarget = () => {
        const newTarget = getTarget(props.target, true);
        if (newTarget !== _targets.current) {
            removeTargetEvents();
            _targets.current = newTarget ? Array.from(newTarget) : [];
            currentTargetElement.current = currentTargetElement.current || _targets.current[0];
            addTargetEvents();
        }
    }

    const toggle = (e) => {
        if (props.disabled || !_isMounted.current) {
            return e && e.preventDefault();
        }

        return props.toggle(e);
    }

    if (!props.isOpen) {
        return null;
    }

    updateTarget();

    const {
        className,
        cssModule,
        innerClassName,
        isOpen: propIsOpen,
        hideArrow,
        boundariesElement,
        placement,
        placementPrefix,
        arrowClassName,
        popperClassName,
        container,
        modifiers,
        offset,
        fade,
        flip,
        children
    } = props;

    const attributes = omit(props, Object.keys(propTypes));

    const popperClasses = mapToCssModules(popperClassName, cssModule);

    const classes = mapToCssModules(innerClassName, cssModule);

    return (
        <PopperContent
            className={className}
            target={currentTargetElement.current || _targets.current[0]}
            isOpen={propIsOpen}
            hideArrow={hideArrow}
            boundariesElement={boundariesElement}
            placement={placement}
            placementPrefix={placementPrefix}
            arrowClassName={arrowClassName}
            popperClassName={popperClasses}
            container={container}
            modifiers={modifiers}
            offset={offset}
            cssModule={cssModule}
            fade={fade}
            flip={flip}
        >
            {({ scheduleUpdate }) => (
                <div
                    {...attributes}
                    ref={getRef}
                    className={classes}
                    role="tooltip"
                    onMouseOver={onMouseOverTooltipContent}
                    onMouseLeave={onMouseLeaveTooltipContent}
                    onKeyDown={onEscKeyDown}
                >
                    {typeof children === 'function' ? children({ scheduleUpdate }) : children}
                </div>
            )}

        </PopperContent>
    );
}

TooltipPopoverWrapper.propTypes = propTypes;
TooltipPopoverWrapper.defaultProps = defaultProps;

export default TooltipPopoverWrapper;
