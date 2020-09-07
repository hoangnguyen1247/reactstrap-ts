import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { mapToCssModules, tagPropType } from './utils';

const propTypes = {
    children: PropTypes.node,
    inline: PropTypes.bool,
    tag: tagPropType,
    innerRef: PropTypes.oneOfType([PropTypes.object, PropTypes.func, PropTypes.string]),
    className: PropTypes.string,
    cssModule: PropTypes.object,
};

const defaultProps = {
    tag: 'form',
};

function Form(props) {

    const getRef = (ref) => {
        if (props.innerRef) {
            props.innerRef(ref);
        }
        this.ref = ref;
    }

    const submit = () => {
        if (this.ref) {
            this.ref.submit();
        }
    }

    const {
        className,
        cssModule,
        inline,
        tag: Tag,
        innerRef,
        ...attributes
    } = props;

    const classes = mapToCssModules(classNames(
        className,
        inline ? 'form-inline' : false
    ), cssModule);

    return (
        <Tag {...attributes} ref={innerRef} className={classes} />
    );
}

Form.propTypes = propTypes;
Form.defaultProps = defaultProps;

export default Form;
