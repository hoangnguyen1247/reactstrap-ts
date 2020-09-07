import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ButtonDropdown from './ButtonDropdown';
import { omit } from './utils';

const omitKeys = ['defaultOpen'];

export default function UncontrolledButtonDropdown(props) {

    const [ isOpen, setIsOpen ] = useState(props.defaultOpen || false);

    const toggle = () => {
        setIsOpen({ isOpen: !isOpen });
    }

    return (
        <ButtonDropdown
            isOpen={isOpen}
            toggle={toggle}
            {...omit(props, omitKeys)}
        />
    )
}

UncontrolledButtonDropdown.propTypes = {
    defaultOpen: PropTypes.bool,
    ...ButtonDropdown.propTypes
};
