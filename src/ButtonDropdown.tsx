import React from 'react';
import PropTypes from 'prop-types';
import Dropdown from './Dropdown';

const propTypes = {
    children: PropTypes.node,
};

export const ButtonDropdown = (props) => {
    return (
        <Dropdown group {...props} />
    );
};

ButtonDropdown.propTypes = propTypes;

export default ButtonDropdown;
