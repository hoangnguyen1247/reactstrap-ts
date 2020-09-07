/* eslint react/prefer-stateless-function: 0 */

import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { mapToCssModules, warnOnce, tagPropType } from './utils';

const propTypes = {
    children: PropTypes.node,
    type: PropTypes.string,
    size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    bsSize: PropTypes.string,
    valid: PropTypes.bool,
    invalid: PropTypes.bool,
    tag: tagPropType,
    innerRef: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.func,
        PropTypes.string
    ]),
    plaintext: PropTypes.bool,
    addon: PropTypes.bool,
    className: PropTypes.string,
    cssModule: PropTypes.object
};

const defaultProps = {
    type: 'text'
};

export function Input(props) {

    const ref = useRef();

    const getRef = (ref) => {
        if (props.innerRef) {
            props.innerRef(ref);
        }
        ref.current = ref;
    }

    const focus = () => {
        if (ref.current) {
            ref.current.focus();
        }
    }

    let {
        className,
        cssModule,
        type,
        bsSize,
        valid,
        invalid,
        tag,
        addon,
        plaintext,
        innerRef,
        ...attributes
    } = props;

    const checkInput = ['radio', 'checkbox'].indexOf(type) > -1;
    const isNotaNumber = new RegExp('\\D', 'g');

    const fileInput = type === 'file';
    const textareaInput = type === 'textarea';
    const selectInput = type === 'select';
    const rangeInput = type === 'range';
    let Tag = tag || (selectInput || textareaInput ? type : 'input');

    let formControlClass: string | undefined = 'form-control';

    if (plaintext) {
        formControlClass = `${formControlClass}-plaintext`;
        Tag = tag || 'input';
    } else if (fileInput) {
        formControlClass = `${formControlClass}-file`;
    } else if (rangeInput) {
        formControlClass = `${formControlClass}-range`;
    } else if (checkInput) {
        if (addon) {
            formControlClass = undefined;
        } else {
            formControlClass = 'form-check-input';
        }
    }

    if (attributes.size && isNotaNumber.test(attributes.size)) {
        warnOnce(
            'Please use the prop "bsSize" instead of the "size" to bootstrap\'s input sizing.'
        );
        bsSize = attributes.size;
        delete attributes.size;
    }

    const classes = mapToCssModules(
        classNames(
            className,
            invalid && 'is-invalid',
            valid && 'is-valid',
            bsSize ? `form-control-${bsSize}` : false,
            formControlClass
        ),
        cssModule
    );

    if (Tag === 'input' || (tag && typeof tag === 'function')) {
        attributes.type = type;
    }

    if (
        attributes.children &&
        !(
            plaintext ||
            type === 'select' ||
            typeof Tag !== 'string' ||
            Tag === 'select'
        )
    ) {
        warnOnce(
            `Input with a type of "${type}" cannot have children. Please use "value"/"defaultValue" instead.`
        );
        delete attributes.children;
    }

    return (
        <Tag
            {...attributes}
            ref={innerRef}
            className={classes}
            aria-invalid={invalid}
        />
    )
}

Input.propTypes = propTypes;
Input.defaultProps = defaultProps;

export default Input;
