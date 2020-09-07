/* eslint react/no-find-dom-node: 0 */
// https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-find-dom-node.md

import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Manager } from 'react-popper';
import classNames from 'classnames';
import { DropdownContext } from './DropdownContext';
import { mapToCssModules, omit, keyCodes, tagPropType } from './utils';

export const propTypes = {
    a11y: PropTypes.bool,
    disabled: PropTypes.bool,
    direction: PropTypes.oneOf(['up', 'down', 'left', 'right']),
    group: PropTypes.bool,
    isOpen: PropTypes.bool,
    nav: PropTypes.bool,
    active: PropTypes.bool,
    addonType: PropTypes.oneOfType([PropTypes.bool, PropTypes.oneOf(['prepend', 'append'])]),
    size: PropTypes.string,
    tag: tagPropType,
    toggle: PropTypes.func,
    children: PropTypes.node,
    className: PropTypes.string,
    cssModule: PropTypes.object,
    inNavbar: PropTypes.bool,
    setActiveFromChild: PropTypes.bool,
};

const defaultProps = {
    a11y: true,
    isOpen: false,
    direction: 'down',
    nav: false,
    active: false,
    addonType: false,
    inNavbar: false,
    setActiveFromChild: false
};

const preventDefaultKeys = [
    keyCodes.space,
    keyCodes.enter,
    keyCodes.up,
    keyCodes.down,
    keyCodes.end,
    keyCodes.home
]

function Dropdown(props) {

    const containerRef = useRef();
    const _$menuCtrl = useRef();

    const prevPropsIsOpen = useRef();

    const getContextValue = () => {
        return {
            toggle: toggle,
            isOpen: props.isOpen,
            direction: (props.direction === 'down' && props.dropup) ? 'up' : props.direction,
            inNavbar: props.inNavbar,
            disabled: props.disabled
        };
    }

    //
    // didMount and willUnmount
    useEffect(() => {
        handleProps();

        return (() => {
            removeEvents();
        })
    }, []);

    //
    // didUpdate
    useEffect(() => {
        if (props.isOpen !== prevPropsIsOpen.current) {
            prevPropsIsOpen.current = props.isOpen;
            handleProps();
        }
    });

    const getContainer = () => {
        return containerRef.current;
    }

    const getMenuCtrl = () => {
        if (_$menuCtrl.current) return _$menuCtrl.current;
        _$menuCtrl.current = getContainer().querySelector('[aria-expanded]');
        return _$menuCtrl.current;
    }

    const getMenuItems = () => {
        return [].slice.call(getContainer().querySelectorAll('[role="menuitem"]'));
    }

    const addEvents = () => {
        ['click', 'touchstart', 'keyup'].forEach(event =>
            document.addEventListener(event, handleDocumentClick, true)
        );
    }

    const removeEvents = () => {
        ['click', 'touchstart', 'keyup'].forEach(event =>
            document.removeEventListener(event, handleDocumentClick, true)
        );
    }

    const handleDocumentClick = (e) => {
        if (e && (e.which === 3 || (e.type === 'keyup' && e.which !== keyCodes.tab))) return;
        const container = getContainer();

        if (container.contains(e.target) && container !== e.target && (e.type !== 'keyup' || e.which === keyCodes.tab)) {
            return;
        }

        toggle(e);
    }

    const handleKeyDown = (e) => {
        if (
            /input|textarea/i.test(e.target.tagName)
            || (keyCodes.tab === e.which && (e.target.getAttribute('role') !== 'menuitem' || !props.a11y))
        ) {
            return;
        }

        if (preventDefaultKeys.indexOf(e.which) !== -1 || ((e.which >= 48) && (e.which <= 90))) {
            e.preventDefault();
        }

        if (props.disabled) return;

        if (getMenuCtrl() === e.target) {
            if (
                !props.isOpen
                && ([keyCodes.space, keyCodes.enter, keyCodes.up, keyCodes.down].indexOf(e.which) > -1)
            ) {
                toggle(e);
                const $menuitems: any[] = getMenuItems();
                setTimeout(() => $menuitems[0].focus());
            } else if (props.isOpen && e.which === keyCodes.esc) {
                toggle(e);
            }
        }

        if (props.isOpen && (e.target.getAttribute('role') === 'menuitem')) {
            if ([keyCodes.tab, keyCodes.esc].indexOf(e.which) > -1) {
                toggle(e);
                getMenuCtrl().focus();
            } else if ([keyCodes.space, keyCodes.enter].indexOf(e.which) > -1) {
                e.target.click();
                getMenuCtrl().focus();
            } else if (
                [keyCodes.down, keyCodes.up].indexOf(e.which) > -1
                || ([keyCodes.n, keyCodes.p].indexOf(e.which) > -1 && e.ctrlKey)
            ) {
                const $menuitems: any[] = getMenuItems();
                let index = $menuitems.indexOf(e.target);
                if (keyCodes.up === e.which || (keyCodes.p === e.which && e.ctrlKey)) {
                    index = index !== 0 ? index - 1 : $menuitems.length - 1;
                } else if (keyCodes.down === e.which || (keyCodes.n === e.which && e.ctrlKey)) {
                    index = index === $menuitems.length - 1 ? 0 : index + 1;
                }
                $menuitems[index].focus();
            } else if (keyCodes.end === e.which) {
                const $menuitems: any[] = getMenuItems();
                $menuitems[$menuitems.length - 1].focus();
            } else if (keyCodes.home === e.which) {
                const $menuitems: any[] = getMenuItems();
                $menuitems[0].focus();
            } else if ((e.which >= 48) && (e.which <= 90)) {
                const $menuitems: any[] = getMenuItems();
                const charPressed = String.fromCharCode(e.which).toLowerCase();
                for (let i = 0; i < $menuitems.length; i += 1) {
                    const firstLetter = $menuitems[i].textContent && $menuitems[i].textContent[0].toLowerCase();
                    if (firstLetter === charPressed) {
                        $menuitems[i].focus();
                        break;
                    }
                }
            }
        }
    }

    const handleProps = () => {
        if (props.isOpen) {
            addEvents();
        } else {
            removeEvents();
        }
    }

    const toggle = (e) => {
        if (props.disabled) {
            return e && e.preventDefault();
        }

        return props.toggle(e);
    }

    const {
        className,
        cssModule,
        direction,
        isOpen,
        group,
        size,
        nav,
        setActiveFromChild,
        active,
        addonType,
        tag,
        ...attrs
    }: any = omit(props, ['toggle', 'disabled', 'inNavbar', 'a11y']);

    const Tag = tag || (nav ? 'li' : 'div');

    let subItemIsActive = false;
    if (setActiveFromChild) {
        React.Children.map(props.children[1].props.children,
            (dropdownItem) => {
                if (dropdownItem && dropdownItem.props.active) subItemIsActive = true;
            }
        );
    }

    const classes = mapToCssModules(classNames(
        className,
        direction !== 'down' && `drop${direction}`,
        nav && active ? 'active' : false,
        setActiveFromChild && subItemIsActive ? 'active' : false,
        {
            [`input-group-${addonType}`]: addonType,
            'btn-group': group,
            [`btn-group-${size}`]: !!size,
            dropdown: !group && !addonType,
            show: isOpen,
            'nav-item': nav
        }
    ), cssModule);

    return (
        <DropdownContext.Provider value={getContextValue()}>
            <Manager>
                <Tag
                    {...attrs}
                    {...{ [typeof Tag === 'string' ? 'ref' : 'innerRef']: containerRef }}
                    onKeyDown={handleKeyDown}
                    className={classes}
                />
            </Manager>
        </DropdownContext.Provider>
    );
}

Dropdown.propTypes = propTypes;
Dropdown.defaultProps = defaultProps;

export default Dropdown;
