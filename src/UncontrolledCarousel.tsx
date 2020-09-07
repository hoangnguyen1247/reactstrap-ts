import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Carousel from './Carousel';
import CarouselItem from './CarouselItem';
import CarouselControl from './CarouselControl';
import CarouselIndicators from './CarouselIndicators';
import CarouselCaption from './CarouselCaption';

const propTypes = {
    items: PropTypes.array.isRequired,
    indicators: PropTypes.bool,
    controls: PropTypes.bool,
    autoPlay: PropTypes.bool,
    defaultActiveIndex: PropTypes.number,
    activeIndex: PropTypes.number,
    next: PropTypes.func,
    previous: PropTypes.func,
    goToIndex: PropTypes.func,
};

function UncontrolledCarousel(props) {

    const animating = useRef(false);
    const [ activeIndex, setActiveIndex ] = useState(props.defaultActiveIndex || 0);

    const onExiting = () => {
        animating.current = true;
    }

    const onExited = () => {
        animating.current = false;
    }

    const next = () => {
        if (animating.current) return;
        const nextIndex = activeIndex === props.items.length - 1 ? 0 : activeIndex + 1;
        setActiveIndex(nextIndex);
    }

    const previous = () => {
        if (animating.current) return;
        const nextIndex = activeIndex === 0 ? props.items.length - 1 : activeIndex - 1;
        setActiveIndex(nextIndex);
    }

    const handleGoToIndex = (newIndex) => {
        if (animating.current) return;
        setActiveIndex(newIndex);
    }

    const { defaultActiveIndex, autoPlay, indicators, controls, items, goToIndex, ...rest } = props;

    const slides = items.map((item) => {
        const key = item.key || item.src;
        return (
            <CarouselItem
                onExiting={onExiting}
                onExited={onExited}
                key={key}
            >
                <img className="d-block w-100" src={item.src} alt={item.altText} />
                <CarouselCaption captionText={item.caption} captionHeader={item.header || item.caption} />
            </CarouselItem>
        );
    });

    return (
        <Carousel
            activeIndex={activeIndex}
            next={next}
            previous={previous}
            ride={autoPlay ? 'carousel' : undefined}
            {...rest}
        >
            {indicators && <CarouselIndicators
                items={items}
                activeIndex={rest.activeIndex || activeIndex}
                onClickHandler={goToIndex || handleGoToIndex}
            />}
            {slides}
            {controls && <CarouselControl
                direction="prev"
                directionText="Previous"
                onClickHandler={rest.previous || previous}
            />}
            {controls && <CarouselControl
                direction="next"
                directionText="Next"
                onClickHandler={rest.next || next}
            />}
        </Carousel>
    );
}

UncontrolledCarousel.propTypes = propTypes;
UncontrolledCarousel.defaultProps = {
    controls: true,
    indicators: true,
    autoPlay: true,
};

export default UncontrolledCarousel;
