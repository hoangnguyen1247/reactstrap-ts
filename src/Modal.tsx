import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Portal from './Portal';
import Fade from './Fade';
import {
    getOriginalBodyPadding,
    conditionallyUpdateScrollbar,
    setScrollbarWidth,
    mapToCssModules,
    omit,
    focusableElements,
    TransitionTimeouts,
    keyCodes,
    targetPropType,
    getTarget
} from './utils';

function noop() { }

const FadePropTypes = PropTypes.shape(Fade.propTypes);

const propTypes = {
    isOpen: PropTypes.bool,
    autoFocus: PropTypes.bool,
    centered: PropTypes.bool,
    scrollable: PropTypes.bool,
    size: PropTypes.string,
    toggle: PropTypes.func,
    keyboard: PropTypes.bool,
    role: PropTypes.string,
    labelledBy: PropTypes.string,
    backdrop: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.oneOf(['static'])
    ]),
    onEnter: PropTypes.func,
    onExit: PropTypes.func,
    onOpened: PropTypes.func,
    onClosed: PropTypes.func,
    children: PropTypes.node,
    className: PropTypes.string,
    wrapClassName: PropTypes.string,
    modalClassName: PropTypes.string,
    backdropClassName: PropTypes.string,
    contentClassName: PropTypes.string,
    external: PropTypes.node,
    fade: PropTypes.bool,
    cssModule: PropTypes.object,
    zIndex: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ]),
    backdropTransition: FadePropTypes,
    modalTransition: FadePropTypes,
    innerRef: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.string,
        PropTypes.func,
    ]),
    unmountOnClose: PropTypes.bool,
    returnFocusAfterClose: PropTypes.bool,
    container: targetPropType
};

const propsToOmit = Object.keys(propTypes);

const defaultProps = {
    isOpen: false,
    autoFocus: true,
    centered: false,
    scrollable: false,
    role: 'dialog',
    backdrop: true,
    keyboard: true,
    zIndex: 1050,
    fade: true,
    onOpened: noop,
    onClosed: noop,
    modalTransition: {
        timeout: TransitionTimeouts.Modal,
    },
    backdropTransition: {
        mountOnEnter: true,
        timeout: TransitionTimeouts.Fade, // uses standard fade transition
    },
    unmountOnClose: true,
    returnFocusAfterClose: true,
    container: 'body'
};

function Modal(props) {
    const _isMounted = useRef(null);
    const _element = useRef(null);
    const _dialog = useRef(null);
    const _mouseDownElement = useRef(null);
    const _triggeringElement = useRef(null);
    const _mountContainer = useRef(null);
    const _originalBodyPadding = useRef(null);
    const _backdropAnimationTimeout = useRef(null);

    const prevPropsIsOpen = useRef(null);
    const prevStateIsOpen = useRef(null);
    const prevPropsZIndex = useRef(null);

    const [ isOpen, setIsOpen ] = useState(false);
    const [ showStaticBackdropAnimation, setShowStaticBackdropAnimation ] = useState(false);

    useEffect(() => {
        const { isOpen: propsIsOpen, autoFocus, onEnter } = props;

        if (propsIsOpen) {
            init();
            setIsOpen(true);
            if (autoFocus) {
                setFocus();
            }
        }

        if (onEnter) {
            onEnter();
        }

        _isMounted.current = true;

        return (() => {
            clearBackdropAnimationTimeout();

            if (props.onExit) {
                props.onExit();
            }

            if (_element.current) {
                destroy();
                if (props.isOpen || isOpen) {
                    close();
                }
            }

            _isMounted.current = false;
        })
    }, [])

    useEffect(() => {
        if (props.isOpen && !prevPropsIsOpen) {
            prevPropsIsOpen.current = props.isOpen;
            init();
            setIsOpen(true);
            // let render() renders Modal Dialog first
            return;
        }

        // now Modal Dialog is rendered and we can refer _element and _dialog
        if (props.autoFocus && isOpen && !prevStateIsOpen) {
            prevStateIsOpen.current = isOpen;
            setFocus();
        }

        if (_element.current && prevPropsZIndex !== props.zIndex) {
            prevPropsZIndex.current = props.zIndex;
            _element.current.style.zIndex = props.zIndex;
        }
    })

    const onOpened = (node, isAppearing) => {
        props.onOpened();
        (props.modalTransition.onEntered || noop)(node, isAppearing);
    }

    const onClosed = (node) => {
        const { unmountOnClose } = props;
        // so all methods get called before it is unmounted
        props.onClosed();
        (props.modalTransition.onExited || noop)(node);

        if (unmountOnClose) {
            destroy();
        }
        close();

        if (_isMounted.current) {
            setIsOpen(false)
        }
    }

    const setFocus = () => {
        if (_dialog.current && _dialog.current.parentNode && typeof _dialog.current.parentNode.focus === 'function') {
            _dialog.current.parentNode.focus();
        }
    }

    const  getFocusableChildren = () => {
        return _element.current.querySelectorAll(focusableElements.join(', '));
    }

    const getFocusedChild = () => {
        let currentFocus;
        const focusableChildren = getFocusableChildren();

        try {
            currentFocus = document.activeElement;
        } catch (err) {
            currentFocus = focusableChildren[0];
        }
        return currentFocus;
    }

    // not mouseUp because scrollbar fires it, shouldn't close when user scrolls
    const handleBackdropClick = (e) => {
        if (e.target === _mouseDownElement.current) {
            e.stopPropagation();

            const backdrop = _dialog.current ? _dialog.current.parentNode : null;

            if (backdrop && e.target === backdrop && props.backdrop === 'static') {
                handleStaticBackdropAnimation();
            }

            if (!props.isOpen || props.backdrop !== true) return;

            if (backdrop && e.target === backdrop && props.toggle) {
                props.toggle(e);
            }
        }
    }

    const handleTab = (e) => {
        if (e.which !== 9) return;

        const focusableChildren = getFocusableChildren();
        const totalFocusable = focusableChildren.length;
        if (totalFocusable === 0) return;
        const currentFocus = getFocusedChild();

        let focusedIndex = 0;

        for (let i = 0; i < totalFocusable; i += 1) {
            if (focusableChildren[i] === currentFocus) {
                focusedIndex = i;
                break;
            }
        }

        if (e.shiftKey && focusedIndex === 0) {
            e.preventDefault();
            focusableChildren[totalFocusable - 1].focus();
        } else if (!e.shiftKey && focusedIndex === totalFocusable - 1) {
            e.preventDefault();
            focusableChildren[0].focus();
        }
    }

    const handleBackdropMouseDown = (e) => {
        _mouseDownElement.current = e.target;
    }

    const handleEscape = (e) => {
        if (props.isOpen && e.keyCode === keyCodes.esc && props.toggle) {
            if (props.keyboard) {
                e.preventDefault();
                e.stopPropagation();

                props.toggle(e);
            }
            else if (props.backdrop === 'static') {
                e.preventDefault();
                e.stopPropagation();

                handleStaticBackdropAnimation();
            }
        }
    }

    const handleStaticBackdropAnimation = () => {
        clearBackdropAnimationTimeout();
        setShowStaticBackdropAnimation(true);
        _backdropAnimationTimeout.current = setTimeout(() => {
            setShowStaticBackdropAnimation(false);
        }, 100);
    }

    const init = () => {
        try {
            _triggeringElement.current = document.activeElement;
        } catch (err) {
            _triggeringElement.current = null;
        }

        if (!_element.current) {
            _element.current = document.createElement('div');
            _element.current.setAttribute('tabindex', '-1');
            _element.current.style.position = 'relative';
            _element.current.style.zIndex = props.zIndex;
            _mountContainer.current = getTarget(props.container);
            _mountContainer.current.appendChild(_element.current);
        }

        _originalBodyPadding.current = getOriginalBodyPadding();
        conditionallyUpdateScrollbar();

        if (Modal.openCount === 0) {
            document.body.className = classNames(
                document.body.className,
                mapToCssModules('modal-open', props.cssModule)
            );
        }

        Modal.openCount += 1;
    }

    const destroy = () => {
        if (_element.current) {
            _mountContainer.current.removeChild(_element.current);
            _element.current = null;
        }

        manageFocusAfterClose();
    }

    const manageFocusAfterClose = () => {
        if (_triggeringElement.current) {
            const { returnFocusAfterClose } = props;
            if (_triggeringElement.current.focus && returnFocusAfterClose) _triggeringElement.current.focus();
            _triggeringElement.current = null;
        }
    }

    const close = () => {
        if (Modal.openCount <= 1) {
            const modalOpenClassName = mapToCssModules('modal-open', props.cssModule);
            // Use regex to prevent matching `modal-open` as part of a different class, e.g. `my-modal-opened`
            const modalOpenClassNameRegex = new RegExp(`(^| )${modalOpenClassName}( |$)`);
            document.body.className = document.body.className.replace(modalOpenClassNameRegex, ' ').trim();
        }
        manageFocusAfterClose();
        Modal.openCount = Math.max(0, Modal.openCount - 1);

        setScrollbarWidth(_originalBodyPadding.current);
    }

    const renderModalDialog = () => {
        const attributes = omit(props, propsToOmit);
        const dialogBaseClass = 'modal-dialog';

        return (
            <div
                {...attributes}
                className={mapToCssModules(classNames(dialogBaseClass, props.className, {
                    [`modal-${props.size}`]: props.size,
                    [`${dialogBaseClass}-centered`]: props.centered,
                    [`${dialogBaseClass}-scrollable`]: props.scrollable,
                }), props.cssModule)}
                role="document"
                ref={(c) => {
                    _dialog.current = c;
                }}
            >
                <div
                    className={mapToCssModules(
                        classNames('modal-content', props.contentClassName),
                        props.cssModule
                    )}
                >
                    {props.children}
                </div>
            </div>
        );
    }

    const clearBackdropAnimationTimeout = () => {
        if (_backdropAnimationTimeout.current) {
            clearTimeout(_backdropAnimationTimeout.current);
            _backdropAnimationTimeout.current = undefined;
        }
    }

    const {
        unmountOnClose
    } = props;

    if (!!_element.current && (isOpen || !unmountOnClose)) {
        const isModalHidden = !!_element.current && !isOpen && !unmountOnClose;
        _element.current.style.display = isModalHidden ? 'none' : 'block';

        const {
            wrapClassName,
            modalClassName,
            backdropClassName,
            cssModule,
            isOpen: propsIsOpen,
            backdrop,
            role,
            labelledBy,
            external,
            innerRef,
        } = props;

        const modalAttributes = {
            onClick: handleBackdropClick,
            onMouseDown: handleBackdropMouseDown,
            onKeyUp: handleEscape,
            onKeyDown: handleTab,
            style: { display: 'block' },
            'aria-labelledby': labelledBy,
            role,
            tabIndex: '-1'
        };

        const hasTransition = props.fade;
        const modalTransition = {
            ...Fade.defaultProps,
            ...props.modalTransition,
            baseClass: hasTransition ? props.modalTransition.baseClass : '',
            timeout: hasTransition ? props.modalTransition.timeout : 0,
        };
        const backdropTransition = {
            ...Fade.defaultProps,
            ...props.backdropTransition,
            baseClass: hasTransition ? props.backdropTransition.baseClass : '',
            timeout: hasTransition ? props.backdropTransition.timeout : 0,
        };

        const Backdrop = backdrop && (
            hasTransition ?
                (<Fade
                    {...backdropTransition}
                    in={propsIsOpen && !!backdrop}
                    cssModule={cssModule}
                    className={mapToCssModules(classNames('modal-backdrop', backdropClassName), cssModule)}
                />)
                : <div className={mapToCssModules(classNames('modal-backdrop', 'show', backdropClassName), cssModule)} />
        );

        return (
            <Portal node={_element.current}>
                <div className={mapToCssModules(wrapClassName)}>
                    <Fade
                        {...modalAttributes}
                        {...modalTransition}
                        in={propsIsOpen}
                        onEntered={onOpened}
                        onExited={onClosed}
                        cssModule={cssModule}
                        className={mapToCssModules(classNames('modal', modalClassName, showStaticBackdropAnimation && 'modal-static'), cssModule)}
                        innerRef={innerRef}
                    >
                        {external}
                        {renderModalDialog()}
                    </Fade>
                    {Backdrop}
                </div>
            </Portal>
        );
    }

    return null;
}

Modal.propTypes = propTypes;
Modal.defaultProps = defaultProps;
Modal.openCount = 0;

export default Modal;
