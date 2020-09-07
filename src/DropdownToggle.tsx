import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Reference } from 'react-popper';
import { DropdownContext } from './DropdownContext';
import { mapToCssModules, tagPropType } from './utils';
import Button from './Button';

const propTypes = {
    caret: PropTypes.bool,
    color: PropTypes.string,
    children: PropTypes.node,
    className: PropTypes.string,
    cssModule: PropTypes.object,
    disabled: PropTypes.bool,
    onClick: PropTypes.func,
    'aria-haspopup': PropTypes.bool,
    split: PropTypes.bool,
    tag: tagPropType,
    nav: PropTypes.bool,
};

const defaultProps = {
    'aria-haspopup': true,
    color: 'secondary',
};

function DropdownToggle(props) {

    const context = useContext(DropdownContext);

    const onClick = (e) => {
        if (props.disabled || context.disabled) {
            e.preventDefault();
            return;
        }

        if (props.nav && !props.tag) {
            e.preventDefault();
        }

        if (props.onClick) {
            props.onClick(e);
        }

        context.toggle(e);
    }

    const { className, color, cssModule, caret, split, nav, tag, innerRef, ...rest } = props;
    const ariaLabel = rest['aria-label'] || 'Toggle Dropdown';
    const classes = mapToCssModules(classNames(
        className,
        {
            'dropdown-toggle': caret || split,
            'dropdown-toggle-split': split,
            'nav-link': nav
        }
    ), cssModule);
    const children =
        typeof rest.children !== 'undefined' ? (
            rest.children
        ) : (
                <span className="sr-only">{ariaLabel}</span>
            );

    let Tag;

    if (nav && !tag) {
        Tag = 'a';
        rest.href = '#';
    } else if (!tag) {
        Tag = Button;
        rest.color = color;
        rest.cssModule = cssModule;
    } else {
        Tag = tag;
    }

    if (context.inNavbar) {
        return (
            <Tag
                {...rest}
                className={classes}
                onClick={onClick}
                aria-expanded={context.isOpen}
                children={children}
            />
        );
    }

    return (
        <Reference innerRef={innerRef}>
            {({ ref }) => (
                <Tag
                    {...rest}
                    {...{ [typeof Tag === 'string' ? 'ref' : 'innerRef']: ref }}

                    className={classes}
                    onClick={onClick}
                    aria-expanded={context.isOpen}
                    children={children}
                />
            )}
        </Reference>
    );
}

DropdownToggle.propTypes = propTypes;
DropdownToggle.defaultProps = defaultProps;

export default DropdownToggle;
