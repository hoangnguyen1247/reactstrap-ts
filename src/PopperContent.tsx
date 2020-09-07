import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import { Popper as ReactPopper } from 'react-popper';
import { getTarget, targetPropType, mapToCssModules, DOMElement, tagPropType } from './utils';
import Fade from './Fade';

function noop() { }

const propTypes = {
    children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
    popperClassName: PropTypes.string,
    placement: PropTypes.string,
    placementPrefix: PropTypes.string,
    arrowClassName: PropTypes.string,
    hideArrow: PropTypes.bool,
    tag: tagPropType,
    isOpen: PropTypes.bool.isRequired,
    cssModule: PropTypes.object,
    offset: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    fallbackPlacement: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    flip: PropTypes.bool,
    container: targetPropType,
    target: targetPropType.isRequired,
    modifiers: PropTypes.object,
    boundariesElement: PropTypes.oneOfType([PropTypes.string, DOMElement]),
    onClosed: PropTypes.func,
    fade: PropTypes.bool,
    transition: PropTypes.shape(Fade.propTypes),
};

const defaultProps = {
    boundariesElement: 'scrollParent',
    placement: 'auto',
    hideArrow: false,
    isOpen: false,
    offset: 0,
    fallbackPlacement: 'flip',
    flip: true,
    container: 'body',
    modifiers: {},
    onClosed: noop,
    fade: true,
    transition: {
        ...Fade.defaultProps,
    }
};

export function PopperContent(props) {

    const _element = useRef();
    const targetNode = useRef();
    const [ isOpen, setIsOpen ] = useState(props.isOpen);

    useEffect(() => {
        if (_element.current && _element.current.childNodes && _element.current.childNodes[0] && _element.current.childNodes[0].focus) {
            _element.current.childNodes[0].focus();
        }
    })

    const setTargetNode = (node) => {
        targetNode.current = typeof node === 'string' ? getTarget(node) : node;
    }

    const getTargetNode = () => {
        return targetNode.current;
    }

    const getContainerNode = () => {
        return getTarget(props.container);
    }

    const getRef = (ref) => {
        _element.current = ref;
    }

    const onClosed = () => {
        props.onClosed();
        setIsOpen(false);
    }

    if (props.isOpen && !isOpen) {
        return setIsOpen(props.isOpen);
    } else setIsOpen(null);

    const renderChildren = () => {
        const {
            cssModule,
            children,
            isOpen,
            flip,
            target,
            offset,
            fallbackPlacement,
            placementPrefix,
            arrowClassName: _arrowClassName,
            hideArrow,
            popperClassName: _popperClassName,
            tag,
            container,
            modifiers,
            boundariesElement,
            onClosed,
            fade,
            transition,
            placement,
            ...attrs
        } = props;
        const arrowClassName = mapToCssModules(classNames(
            'arrow',
            _arrowClassName
        ), cssModule);
        const popperClassName = mapToCssModules(classNames(
            _popperClassName,
            placementPrefix ? `${placementPrefix}-auto` : ''
        ), props.cssModule);

        const extendedModifiers = {
            offset: { offset },
            flip: { enabled: flip, behavior: fallbackPlacement },
            preventOverflow: { boundariesElement },
            ...modifiers,
        };

        const popperTransition = {
            ...Fade.defaultProps,
            ...transition,
            baseClass: fade ? transition.baseClass : '',
            timeout: fade ? transition.timeout : 0,
        }

        return (
            <Fade
                {...popperTransition}
                {...attrs}
                in={isOpen}
                onExited={onClosed}
                tag={tag}
            >
                <ReactPopper
                    referenceElement={targetNode.current}
                    modifiers={extendedModifiers}
                    placement={placement}
                >
                    {({ ref, style, placement, outOfBoundaries, arrowProps, scheduleUpdate }) => (
                        <div ref={ref} style={style} className={popperClassName} x-placement={placement} x-out-of-boundaries={outOfBoundaries ? 'true' : undefined}>
                            {typeof children === 'function' ? children({ scheduleUpdate }) : children}
                            {!hideArrow && <span ref={arrowProps.ref} className={arrowClassName} style={arrowProps.style} />}
                        </div>
                    )}
                </ReactPopper>
            </Fade>
        );
    }

    setTargetNode(props.target);

    if (isOpen) {
        return props.container === 'inline' ?
            renderChildren() :
            ReactDOM.createPortal((<div ref={getRef}>{renderChildren()}</div>), getContainerNode());
    }

    return null;
}

PopperContent.propTypes = propTypes;
PopperContent.defaultProps = defaultProps;

export default PopperContent;
