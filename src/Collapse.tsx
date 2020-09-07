import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Transition } from 'react-transition-group';
import { mapToCssModules, omit, pick, TransitionTimeouts, TransitionPropTypeKeys, TransitionStatuses, tagPropType } from './utils';

const propTypes = {
    ...Transition.propTypes,
    isOpen: PropTypes.bool,
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node
    ]),
    tag: tagPropType,
    className: PropTypes.node,
    navbar: PropTypes.bool,
    cssModule: PropTypes.object,
    innerRef: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.string,
        PropTypes.object
    ]),
};

const defaultProps = {
    ...Transition.defaultProps,
    isOpen: false,
    appear: false,
    enter: true,
    exit: true,
    tag: 'div',
    timeout: TransitionTimeouts.Collapse,
};

const transitionStatusToClassHash = {
    [TransitionStatuses.ENTERING]: 'collapsing',
    [TransitionStatuses.ENTERED]: 'collapse show',
    [TransitionStatuses.EXITING]: 'collapsing',
    [TransitionStatuses.EXITED]: 'collapse',
};

function getTransitionClass(status) {
    return transitionStatusToClassHash[status] || 'collapse';
}

function getHeight(node) {
    return node.scrollHeight;
}

export function Collapse(props) {

    const [ height, setHeight ] = useState(null);

    const onEntering = (node, isAppearing) => {
        setHeight(getHeight(node));
        props.onEntering(node, isAppearing);
    }

    const onEntered = (node, isAppearing) => {
        setHeight(null);
        props.onEntered(node, isAppearing);
    }

    const onExit = (node) => {
        setHeight(getHeight(node));
        props.onExit(node);
    }

    const onExiting = (node) => {
        // getting this variable triggers a reflow
        const _unused = node.offsetHeight; // eslint-disable-line no-unused-vars
        setHeight(0);
        props.onExiting(node);
    }

    const onExited = (node) => {
        setHeight(null);
        props.onExited(node);
    }

    const {
        tag: Tag,
        isOpen,
        className,
        navbar,
        cssModule,
        children,
        innerRef,
        ...otherProps
    } = props;

    const transitionProps = pick(otherProps, TransitionPropTypeKeys);
    const childProps: any = omit(otherProps, TransitionPropTypeKeys);
    return (
        <Transition
            {...transitionProps}
            in={isOpen}
            onEntering={onEntering}
            onEntered={onEntered}
            onExit={onExit}
            onExiting={onExiting}
            onExited={onExited}
        >
            {(status) => {
                let collapseClass = getTransitionClass(status);
                const classes = mapToCssModules(classNames(
                    className,
                    collapseClass,
                    navbar && 'navbar-collapse'
                ), cssModule);
                const style = height === null ? null : { height };
                return (
                    <Tag
                        {...childProps}
                        style={{ ...childProps.style, ...style }}
                        className={classes}
                        ref={props.innerRef}
                    >
                        {children}
                    </Tag>
                );
            }}
        </Transition>
    );
}

Collapse.propTypes = propTypes;
Collapse.defaultProps = defaultProps;

export default Collapse;
