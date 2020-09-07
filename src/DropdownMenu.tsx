import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Popper } from 'react-popper';
import { DropdownContext } from './DropdownContext';
import { mapToCssModules, tagPropType } from './utils';

const propTypes = {
    tag: tagPropType,
    children: PropTypes.node.isRequired,
    right: PropTypes.bool,
    flip: PropTypes.bool,
    modifiers: PropTypes.object,
    className: PropTypes.string,
    cssModule: PropTypes.object,
    persist: PropTypes.bool,
    positionFixed: PropTypes.bool,
};

const defaultProps = {
    tag: 'div',
    flip: true,
};

const noFlipModifier = { flip: { enabled: false } };

const directionPositionMap = {
    up: 'top',
    left: 'left',
    right: 'right',
    down: 'bottom',
};

export function DropdownMenu(props) {

    const context = useContext(DropdownContext);

    const { className, cssModule, right, tag, flip, modifiers, persist, positionFixed, ...attrs } = props;
    const classes = mapToCssModules(classNames(
        className,
        'dropdown-menu',
        {
            'dropdown-menu-right': right,
            show: context.isOpen,
        }
    ), cssModule);

    const Tag = tag;

    if (persist || (context.isOpen && !context.inNavbar)) {

        const position1 = directionPositionMap[context.direction] || 'bottom';
        const position2 = right ? 'end' : 'start';
        const poperPlacement = `${position1}-${position2}`;
        const poperModifiers = !flip ? {
            ...modifiers,
            ...noFlipModifier,
        } : modifiers;
        const popperPositionFixed = !!positionFixed;

        return (
            <Popper
                placement={poperPlacement}
                modifiers={poperModifiers}
                positionFixed={popperPositionFixed}
            >
                {({ ref, style, placement }) => (
                    <Tag
                        tabIndex="-1"
                        role="menu"
                        ref={ref}
                        style={style}
                        {...attrs}
                        aria-hidden={!context.isOpen}
                        className={classes}
                        x-placement={placement}
                    />
                )}
            </Popper>
        );
    }

    return (
        <Tag
            tabIndex="-1"
            role="menu"
            {...attrs}
            aria-hidden={!context.isOpen}
            className={classes}
            x-placement={attrs.placement}
        />
    );
};

DropdownMenu.propTypes = propTypes;
DropdownMenu.defaultProps = defaultProps;

export default DropdownMenu;