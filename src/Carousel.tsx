import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import CarouselItem from './CarouselItem';
import { mapToCssModules } from './utils';

const SWIPE_THRESHOLD = 40;

function Carousel(props) {

    const touchStartX = useRef(0);
    const touchStartY = useRef(0);
    const cycleInterval = useRef(undefined);

    const [ activeIndex, setActiveIndex ] = useState(props.activeIndex);
    const [ direction, setDirection ] = useState('right');
    const [ indicatorClicked, setIndicatorClicked ] = useState(false);

    const getChildContext = () => {
        return { direction: direction };
    }

    if (props.activeIndex !== activeIndex) {
        // Calculate the direction to turn
        if (props.activeIndex === activeIndex + 1) {
            setDirection('right');
        } else if (props.activeIndex === activeIndex - 1) {
            setDirection('left');
        } else if (props.activeIndex < activeIndex) {
            setDirection(indicatorClicked ? 'left' : 'right');
        } else if (props.activeIndex !== activeIndex) {
            setDirection(indicatorClicked ? 'right' : 'left');
        }

        setActiveIndex(props.activeIndex);
        setIndicatorClicked(false);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.activeIndex === this.state.activeIndex) return;
        handleSetInterval(props);
    }

    useEffect(() => {
        // Set up the cycle
        if (props.ride === 'carousel') {
            handleSetInterval();
        }

        // TODO: move this to the specific carousel like bootstrap. Currently it will trigger ALL carousels on the page.
        document.addEventListener('keyup', handleKeyPress);

        return (() => {
            handleClearInterval();
            document.removeEventListener('keyup', handleKeyPress);
        })
    })

    const handleSetInterval = (props = props) => {
        // make sure not to have multiple intervals going...
        handleClearInterval();
        if (props.interval) {
            cycleInterval.current = setInterval(() => {
                props.next();
            }, parseInt(props.interval, 10));
        }
    }

    const handleClearInterval = () => {
        clearInterval(cycleInterval.current);
    }

    const hoverStart = (...args) => {
        if (props.pause === 'hover') {
            handleClearInterval();
        }
        if (props.mouseEnter) {
            props.mouseEnter(...args);
        }
    }

    const hoverEnd = (...args) => {
        if (props.pause === 'hover') {
            handleSetInterval();
        }
        if (props.mouseLeave) {
            props.mouseLeave(...args);
        }
    }

    const handleKeyPress = (evt) => {
        if (props.keyboard) {
            if (evt.keyCode === 37) {
                props.previous();
            } else if (evt.keyCode === 39) {
                props.next();
            }
        }
    }

    const handleTouchStart = (e) => {
        if (!props.enableTouch) {
            return;
        }
        touchStartX.current = e.changedTouches[0].screenX;
        touchStartY.current = e.changedTouches[0].screenY;
    }

    const handleTouchEnd = (e) => {
        if (!props.enableTouch) {
            return;
        }

        const currentX = e.changedTouches[0].screenX;
        const currentY = e.changedTouches[0].screenY;
        const diffX = Math.abs(touchStartX.current - currentX);
        const diffY = Math.abs(touchStartY.current - currentY);

        // Don't swipe if Y-movement is bigger than X-movement
        if (diffX < diffY) {
            return;
        }

        if (diffX < SWIPE_THRESHOLD) {
            return;
        }

        if (currentX < touchStartX.current) {
            props.next();
        } else {
            props.previous();
        }
    }

    const renderItems = (carouselItems, className) => {
        const { slide } = props;
        return (
            <div className={className}>
                {carouselItems.map((item, index) => {
                    const isIn = (index === activeIndex);
                    return React.cloneElement(item, {
                        in: isIn,
                        slide: slide,
                    });
                })}
            </div>
        );
    }

    const { cssModule, slide, className } = props;
    const outerClasses = mapToCssModules(classNames(
        className,
        'carousel',
        slide && 'slide'
    ), cssModule);

    const innerClasses = mapToCssModules(classNames(
        'carousel-inner'
    ), cssModule);

    // filter out booleans, null, or undefined
    const children = props.children.filter(child => child !== null && child !== undefined && typeof child !== 'boolean');

    const slidesOnly = children.every(child => child.type === CarouselItem);

    // Rendering only slides
    if (slidesOnly) {
        return (
            <div className={outerClasses} onMouseEnter={hoverStart} onMouseLeave={hoverEnd}>
                {renderItems(children, innerClasses)}
            </div>
        );
    }

    // Rendering slides and controls
    if (children[0] instanceof Array) {
        const carouselItems = children[0];
        const controlLeft = children[1];
        const controlRight = children[2];

        return (
            <div className={outerClasses} onMouseEnter={hoverStart} onMouseLeave={hoverEnd}>
                {renderItems(carouselItems, innerClasses)}
                {controlLeft}
                {controlRight}
            </div>
        );
    }

    // Rendering indicators, slides and controls
    const indicators = children[0];
    const wrappedOnClick = (e) => {
        if (typeof indicators.props.onClickHandler === 'function') {
            setIndicatorClicked(true);
            indicators.props.onClickHandler(e);
        }
    };
    const wrappedIndicators = React.cloneElement(indicators, { onClickHandler: wrappedOnClick });
    const carouselItems = children[1];
    const controlLeft = children[2];
    const controlRight = children[3];

    return (
        <div className={outerClasses} onMouseEnter={hoverStart} onMouseLeave={hoverEnd}
            onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            {wrappedIndicators}
            {renderItems(carouselItems, innerClasses)}
            {controlLeft}
            {controlRight}
        </div>
    );
}

Carousel.propTypes = {
    // the current active slide of the carousel
    activeIndex: PropTypes.number,
    // a function which should advance the carousel to the next slide (via activeIndex)
    next: PropTypes.func.isRequired,
    // a function which should advance the carousel to the previous slide (via activeIndex)
    previous: PropTypes.func.isRequired,
    // controls if the left and right arrow keys should control the carousel
    keyboard: PropTypes.bool,
    /* If set to "hover", pauses the cycling of the carousel on mouseenter and resumes the cycling of the carousel on
     * mouseleave. If set to false, hovering over the carousel won't pause it. (default: "hover")
     */
    pause: PropTypes.oneOf(['hover', false]),
    // Autoplays the carousel after the user manually cycles the first item. If "carousel", autoplays the carousel on load.
    // This is how bootstrap defines it... I would prefer a bool named autoplay or something...
    ride: PropTypes.oneOf(['carousel']),
    // the interval at which the carousel automatically cycles (default: 5000)
    // eslint-disable-next-line react/no-unused-prop-types
    interval: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
        PropTypes.bool,
    ]),
    children: PropTypes.array,
    // called when the mouse enters the Carousel
    mouseEnter: PropTypes.func,
    // called when the mouse exits the Carousel
    mouseLeave: PropTypes.func,
    // controls whether the slide animation on the Carousel works or not
    slide: PropTypes.bool,
    cssModule: PropTypes.object,
    className: PropTypes.string,
    enableTouch: PropTypes.bool,
};

Carousel.defaultProps = {
    interval: 5000,
    pause: 'hover',
    keyboard: true,
    slide: true,
    enableTouch: true,
};

Carousel.childContextTypes = {
    direction: PropTypes.string
};

export default Carousel;
