import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { canUseDOM } from './utils';

const propTypes = {
    children: PropTypes.node.isRequired,
    node: PropTypes.any
};

function Portal(props) {

    const defaultNode = useRef();

    useEffect(() => {

        return (() => {
            if (defaultNode.current) {
                document.body.removeChild(defaultNode.current);
            }
            defaultNode.current = null;
        })
    })

    if (!canUseDOM) {
        return null;
    }

    if (!props.node && !defaultNode.current) {
        defaultNode.current = document.createElement('div');
        document.body.appendChild(defaultNode.current);
    }

    return ReactDOM.createPortal(
        props.children,
        props.node || defaultNode.current
    );
}

Portal.propTypes = propTypes;

export default Portal;
