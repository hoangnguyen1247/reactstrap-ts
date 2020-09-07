import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Transition } from 'react-transition-group';
import { mapToCssModules, TransitionTimeouts, TransitionStatuses, tagPropType } from './utils';

export function CarouselItem(props, context) {

    const [ startAnimation, setStartAnimation ] = useState(false);

    const onEnter = (node, isAppearing) => {
        setStartAnimation(false);
        props.onEnter(node, isAppearing);
    }

    const onEntering = (node, isAppearing) => {
        // getting this variable triggers a reflow
        const offsetHeight = node.offsetHeight;
        setStartAnimation(true);
        props.onEntering(node, isAppearing);
        return offsetHeight;
    }

    const onExit = (node) => {
        setStartAnimation(false)
        props.onExit(node);
    }

    const onExiting = (node) => {
        setStartAnimation(true);
        node.dispatchEvent(new CustomEvent('slide.bs.carousel'));
        props.onExiting(node);
    }

    const onExited = (node) => {
        node.dispatchEvent(new CustomEvent('slid.bs.carousel'));
        props.onExited(node);
    }

    const { in: isIn, children, cssModule, slide, tag: Tag, className, ...transitionProps } = props;

    return (
        <Transition
            {...transitionProps}
            enter={slide}
            exit={slide}
            in={isIn}
            onEnter={onEnter}
            onEntering={onEntering}
            onExit={onExit}
            onExiting={onExiting}
            onExited={onExited}
        >
            {(status) => {
                // TODO: recheck context?
                const { direction } = context;
                const isActive = (status === TransitionStatuses.ENTERED) || (status === TransitionStatuses.EXITING);
                const directionClassName = (status === TransitionStatuses.ENTERING || status === TransitionStatuses.EXITING) &&
                    startAnimation &&
                    (direction === 'right' ? 'carousel-item-left' : 'carousel-item-right');
                const orderClassName = (status === TransitionStatuses.ENTERING) &&
                    (direction === 'right' ? 'carousel-item-next' : 'carousel-item-prev');
                const itemClasses = mapToCssModules(classNames(
                    className,
                    'carousel-item',
                    isActive && 'active',
                    directionClassName,
                    orderClassName,
                ), cssModule);

                return (
                    <Tag className={itemClasses}>
                        {children}
                    </Tag>
                );
            }}
        </Transition>
    );
}

CarouselItem.propTypes = {
    ...Transition.propTypes,
    tag: tagPropType,
    in: PropTypes.bool,
    cssModule: PropTypes.object,
    children: PropTypes.node,
    slide: PropTypes.bool,
    className: PropTypes.string,
};

CarouselItem.defaultProps = {
    ...Transition.defaultProps,
    tag: 'div',
    timeout: TransitionTimeouts.Carousel,
    slide: true,
};

CarouselItem.contextTypes = {
    direction: PropTypes.string
};

export default CarouselItem;
