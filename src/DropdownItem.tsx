import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { DropdownContext } from './DropdownContext';
import { mapToCssModules, omit, tagPropType } from './utils';

const propTypes = {
    children: PropTypes.node,
    active: PropTypes.bool,
    disabled: PropTypes.bool,
    divider: PropTypes.bool,
    tag: tagPropType,
    header: PropTypes.bool,
    onClick: PropTypes.func,
    className: PropTypes.string,
    cssModule: PropTypes.object,
    toggle: PropTypes.bool
};

const defaultProps = {
    tag: 'button',
    toggle: true
};

function DropdownItem(props) {

    const {
        toggle,
    } = useContext(DropdownContext);

    const onClick = (e) => {
        if (props.disabled || props.header || props.divider) {
            e.preventDefault();
            return;
        }

        if (props.onClick) {
            props.onClick(e);
        }

        if (props.toggle) {
            toggle(e);
        }
    }

    const getTabIndex = () => {
        if (props.disabled || props.header || props.divider) {
            return -1;
        }

        return 0;
    }

    const tabIndex = getTabIndex();
    const role = tabIndex > -1 ? 'menuitem' : undefined;
    let {
        className,
        cssModule,
        divider,
        tag: Tag,
        header,
        active,
        ...rest
    }: any = omit(props, ['toggle']);

    const classes = mapToCssModules(classNames(
        className,
        {
            disabled: rest.disabled,
            'dropdown-item': !divider && !header,
            active: active,
            'dropdown-header': header,
            'dropdown-divider': divider
        }
    ), cssModule);

    if (Tag === 'button') {
        if (header) {
            Tag = 'h6';
        } else if (divider) {
            Tag = 'div';
        } else if (rest.href) {
            Tag = 'a';
        }
    }

    return (
        <Tag
            type={(Tag === 'button' && (rest.onClick || props.toggle)) ? 'button' : undefined}
            {...rest}
            tabIndex={tabIndex}
            role={role}
            className={classes}
            onClick={onClick}
        />
    );
}

DropdownItem.propTypes = propTypes;
DropdownItem.defaultProps = defaultProps;
DropdownItem.contextType = DropdownContext;

export default DropdownItem;
