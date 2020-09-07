import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Dropdown, { propTypes } from './Dropdown';
import { omit } from './utils';

const omitKeys = ['defaultOpen'];

export default function UncontrolledDropdown(props) {

    const [ isOpen, setIsOpen ] = useState(props.defaultOpen || false);

    const toggle = (e) => {
        setIsOpen(!isOpen);
        if (props.onToggle) {
            props.onToggle(e, !isOpen);
        }
    }

    return (
        <Dropdown
            isOpen={isOpen}
            toggle={toggle}
            {...omit(props, omitKeys)}
        />
    )
}

UncontrolledDropdown.propTypes = {
    defaultOpen: PropTypes.bool,
    onToggle: PropTypes.func,
    ...propTypes
};
