import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { mapToCssModules, tagPropType } from './utils';

const propTypes = {
    tag: tagPropType,
    innerRef: PropTypes.oneOfType([PropTypes.object, PropTypes.func, PropTypes.string]),
    disabled: PropTypes.bool,
    active: PropTypes.bool,
    className: PropTypes.string,
    cssModule: PropTypes.object,
    onClick: PropTypes.func,
    href: PropTypes.any,
};

const defaultProps = {
    tag: 'a',
};

export function NavLink(props) {

    const onClick = (e) => {
        if (props.disabled) {
            e.preventDefault();
            return;
        }

        if (props.href === '#') {
            e.preventDefault();
        }

        if (props.onClick) {
            props.onClick(e);
        }
    }

    let {
        className,
        cssModule,
        active,
        tag: Tag,
        innerRef,
        ...attributes
    } = props;

    const classes = mapToCssModules(classNames(
        className,
        'nav-link',
        {
            disabled: attributes.disabled,
            active: active
        }
    ), cssModule);

    return (
        <Tag {...attributes} ref={innerRef} onClick={onClick} className={classes} />
    );
}

NavLink.propTypes = propTypes;
NavLink.defaultProps = defaultProps;

export default NavLink;
