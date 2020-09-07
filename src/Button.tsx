import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { mapToCssModules, tagPropType } from './utils';

const propTypes = {
    active: PropTypes.bool,
    'aria-label': PropTypes.string,
    block: PropTypes.bool,
    color: PropTypes.string,
    disabled: PropTypes.bool,
    outline: PropTypes.bool,
    tag: tagPropType,
    innerRef: PropTypes.oneOfType([PropTypes.object, PropTypes.func, PropTypes.string]),
    onClick: PropTypes.func,
    size: PropTypes.string,
    children: PropTypes.node,
    className: PropTypes.string,
    cssModule: PropTypes.object,
    close: PropTypes.bool,
};

const defaultProps = {
    color: 'secondary',
    tag: 'button',
};

export function Button(props) {

    const onClick = (e) => {
        if (props.disabled) {
            e.preventDefault();
            return;
        }

        if (props.onClick) {
            return props.onClick(e);
        }
    }

    let {
        active,
        'aria-label': ariaLabel,
        block,
        className,
        close,
        cssModule,
        color,
        outline,
        size,
        tag: Tag,
        innerRef,
        ...attributes
    } = props;

    if (close && typeof attributes.children === 'undefined') {
        attributes.children = <span aria-hidden>×</span>;
    }

    const btnOutlineColor = `btn${outline ? '-outline' : ''}-${color}`;

    const classes = mapToCssModules(classNames(
        className,
        { close },
        close || 'btn',
        close || btnOutlineColor,
        size ? `btn-${size}` : false,
        block ? 'btn-block' : false,
        { active, disabled: props.disabled }
    ), cssModule);

    if (attributes.href && Tag === 'button') {
        Tag = 'a';
    }

    const defaultAriaLabel = close ? 'Close' : null;

    return (
        <Tag
            type={(Tag === 'button' && attributes.onClick) ? 'button' : undefined}
            {...attributes}
            className={classes}
            ref={innerRef}
            onClick={onClick}
            aria-label={ariaLabel || defaultAriaLabel}
        />
    );
}

Button.propTypes = propTypes;
Button.defaultProps = defaultProps;

export default Button;
