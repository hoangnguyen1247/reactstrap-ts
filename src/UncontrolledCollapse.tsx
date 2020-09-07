import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Collapse from './Collapse';
import { omit, findDOMElements, defaultToggleEvents, addMultipleEventListeners } from './utils';

const omitKeys = ['toggleEvents', 'defaultOpen'];

const propTypes = {
    defaultOpen: PropTypes.bool,
    toggler: PropTypes.string.isRequired,
    toggleEvents: PropTypes.arrayOf(PropTypes.string)
};

const defaultProps = {
    toggleEvents: defaultToggleEvents
};

function UncontrolledCollapse(props) {

    const togglers = useRef([]);
    const removeEventListeners = useRef([]);
    const [ isOpen, setIsOpen ] = useState(props.defaultOpen || false);

    useEffect(() => {
        togglers.current = findDOMElements(props.toggler);
        if (togglers.current.length) {
            removeEventListeners.current = addMultipleEventListeners(
                togglers.current,
                toggle,
                props.toggleEvents
            );
        }

        return (() => {
            if (togglers.current.length && removeEventListeners.current) {
                removeEventListeners.current();
            }
        })
    })

    const toggle = (e) => {
        setIsOpen(!isOpen);
        e.preventDefault();
    }

    return (
        <Collapse
            isOpen={isOpen}
            {...omit(props, omitKeys)}
        />
    )
}

UncontrolledCollapse.propTypes = propTypes;
UncontrolledCollapse.defaultProps = defaultProps;

export default UncontrolledCollapse;
