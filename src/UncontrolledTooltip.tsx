import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Tooltip from './Tooltip';
import { omit } from './utils';

const omitKeys = ['defaultOpen'];

export default function UncontrolledTooltip(props) {

    const [ isOpen, setIsOpen ] = useState(props.defaultOpen || false);

    const toggle = () => {
        setIsOpen(!isOpen);
    }

    return (
        <Tooltip
            isOpen={isOpen}
            toggle={toggle}
            {...omit(props, omitKeys)}
        />
    )
}

UncontrolledTooltip.propTypes = {
    defaultOpen: PropTypes.bool,
    ...Tooltip.propTypes
};
