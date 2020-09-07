/* global jest */
/* eslint-disable import/no-extraneous-dependencies */
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

// FIXME: fix these types
global.requestAnimationFrame = function (cb) { cb(0); };
global.window.cancelAnimationFrame = function () { };
global.createSpyObj = (baseName, methodNames) => {
    const obj = {};

    for (let i = 0; i < methodNames.length; i += 1) {
        obj[methodNames[i]] = jest.fn();
    }

    return obj;
};
global.document.createRange = () => ({
    setStart: () => { },
    setEnd: () => { },
    commonAncestorContainer: {},
});
