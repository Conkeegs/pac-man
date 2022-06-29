'use strict';

/**
 * 
 * @param {String} name
 * @param {String} id
 * @param {String} classes
 * @returns HTMLElement
 */
function create(name, id = null, classes = null) {
    let element = document.createElement(name);

    if (id) {
        element.id = id;
    }

    if (classes) {
        classes = classes.split(' ');
        element.classList.add(...classes);
    }

    return element;
}

/**
 * 
 * @param {String} id 
 * @returns HTMLElement
 */
function get(id) {
    return document.getElementById(id);
}

/**
 * 
 * @param {Object} options 
 */
HTMLElement.prototype.css = function(options) {
    for (let [key, value] of Object.entries(options)) {
        this.style[key] = value;
    }
}