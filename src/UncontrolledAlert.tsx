import React, { useState } from 'react';
import Alert from './Alert';

export function UncontrolledAlert(props) {

    const [ isOpen, setIsOpen ] = useState(true);

    const toggle = () => {
        setIsOpen(!isOpen);
    }

    return (
        <Alert
            isOpen={isOpen}
            toggle={toggle}
            {...props}
        />
    )
}

export default UncontrolledAlert;
