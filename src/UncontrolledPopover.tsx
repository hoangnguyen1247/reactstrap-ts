import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Popover from './Popover';
import { omit } from './utils';

const omitKeys = ['defaultOpen'];

export function UncontrolledPopover (props) {
    const [ isOpen, setIsOpen ] = useState(props.defaultOpen || false);

    const toggle = () => {
        setIsOpen({ isOpen: !isOpen });
    }

    return (
        <Popover
            isOpen={isOpen}
            toggle={toggle}
            {...omit(props, omitKeys)}
        />)
}

UncontrolledPopover.propTypes = {
    defaultOpen: PropTypes.bool,
    ...Popover.propTypes
};

export default UncontrolledPopover;
