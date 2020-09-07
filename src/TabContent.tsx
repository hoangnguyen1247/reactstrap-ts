import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { TabContext } from './TabContext';
import { mapToCssModules, omit, tagPropType } from './utils';


const propTypes = {
    tag: tagPropType,
    activeTab: PropTypes.any,
    className: PropTypes.string,
    cssModule: PropTypes.object,
};

const defaultProps = {
    tag: 'div',
};


export function TabContent(props) {

    const [ activeTab, setActiveTab ] = useState(props.activeTab);

    // TODO: recheck getDerivedStateFromProps prevState.activeTab !== nextProps.activeTab
    if (props.activeTab !== activeTab) {
        setActiveTab(props.activeTab);
    }

    const {
        className,
        cssModule,
        tag: Tag,
    } = props;

    const attributes = omit(props, Object.keys(propTypes));

    const classes = mapToCssModules(classNames('tab-content', className), cssModule);

    return (
        <TabContext.Provider value={{ activeTabId: activeTab }}>
            <Tag {...attributes} className={classes} />
        </TabContext.Provider>
    );
}

export default TabContent;

TabContent.propTypes = propTypes;
TabContent.defaultProps = defaultProps;

