import React, { useState } from "react";
import PropTypes from 'prop-types';
import Button from "./Button";
import classNames from 'classnames';
import { mapToCssModules } from './utils';

const propTypes = {
    onClick: PropTypes.func,
    onBlur: PropTypes.func,
    onFocus: PropTypes.func,
    defaultValue: PropTypes.bool,
};

const defaultProps = {
    defaultValue: false,
};

function ButtonToggle (props) {
    const [ toggled, setToggled ] = useState(props.defaultValue);
    const [ focus, setFocus ] = useState(false);

    const onBlur = (e) => {
        if (props.onBlur) {
            props.onBlur(e);
        }

        setFocus(false);
    }

    const onFocus = (e) => {
        if (props.onFocus) {
            props.onFocus(e);
        }

        setFocus(true);
    }

    const onClick = (e) => {
        if (props.onClick) {
            props.onClick(e);
        }

        setToggled(!toggled)
    }

        const {
            className,
            ...attributes
        } = props;

        const classes = mapToCssModules(classNames(
            className,
            {
                focus: focus,
            }
        ), props.cssModule);

        return <Button
            active={toggled}
            onBlur={onBlur}
            onFocus={onFocus}
            onClick={onClick}
            className={classes}
            {...attributes}
        />;
}

ButtonToggle.propTypes = propTypes;
ButtonToggle.defaultProps = defaultProps;

export default ButtonToggle;
