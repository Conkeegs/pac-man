'use strict';

/**
 * 
 * @param {String} filename 
 * @returns 
 */
function fetchJSON(filename) {
    return fetch(filename).then((response) => {
        return response.json();
    }).then((body) => {
        if (!body) {
            throw new Error('JSON response body is empty.');
        } else {
            return body;
        }
    }).catch((error) => {
        DebugWindow.error('Helpers.js', 'fetchJSON', `'${error.message}' while fetching data in ${filename}.`);
    });
}

/**
 *
 * @param {String} name
 * @param {String} id
 * @param {String} classes
 * @returns {HTMLElement} test
 */
function create(name, id = null, classes = null, html = null) {
    let element = document.createElement(name);

    if (id) {
        element.id = id;
    }

    if (classes) {
        classes = classes.split(' ');
        element.classList.add(...classes);
    }

    if (html) {
        element.innerHTML = html;
    }

    return element;
}

/**
 *
 * @param {String} selector 
 * @returns
 */
function get(selector) {
    return document.getElementById(selector) || document.getElementsByClassName(selector);
}

/**
 *
 * @param {Number|String} pixels 
 * @returns
 */
function px(pixels) {
    if (pixels !== null) {
        if (!isNaN(Number(pixels))) {
            return pixels + 'px';
        }

        let pixelsSliced = pixels.toString().slice(-2);
        
        if (pixelsSliced == 'px') {
            return Number(pixels.substring(0, pixels.indexOf(pixelsSliced)));
        }
    }

    return null;
}

/**
 *s
 * @param {Any} any
 * @returns
 */
function isObject(any) {
    if (any instanceof Object && any !== null && !Array.isArray(any) && typeof any !== 'function') {
        return true;
    } else {
        return false;
    }
}

/**
 *
 * @param {Any} any
 * @param {Any} def
 * @returns
 */
function maybe(any, def) {
    if (typeof any !== 'undefined' && any !== null) {
        return any;
    } else {
        return def;
    }
}

/**
 * 
 * @param {Any} any 
 * @returns {boolean}
 */
function exists(any) {
    return any !== null && typeof any !== 'undefined';
}

/**
 *
 * @param {Any} any
 * @param {Any} def
 * @returns
 */
function truthy(any, def) {
    if (any) {
        return any;
    } else {
        return def;
    }
}

/**
 * 
 * @param  {...any} any 
 */
function die(...any) {
    console.log(...any);
    stop();
    throw new Error('Stopping...');
}

/**
 * 
 * @param {Object} options
 * @returns
 */
HTMLElement.prototype.css = function(style) {
    if (isObject(style)) {
        for (let [key, value] of Object.entries(style)) {
            if (value !== null) {
                this.style[key] = value;
            }
        }
    
        return this;
    } else {
        return this.style[style];
    }
}

HTMLCollection.prototype.css = function(style) {
    if (isObject(style)) {
        for (let item of this) {
            if (item instanceof HTMLElement) {
                item.css(style);
            } else {
                DebugWindow.error('Helpers.js', 'css()', 'Item in HTMLCollection not instance of HTMLElement');
            }
        }
    } else {
        return null;
    }
};