'use strict';

const os = require('os');
const EventEmitter = require('eventemitter3');
const _ = require('lodash');

module.exports = {
    on: _on,
    start: _start, 
    stop: _stop
}

let interval = null;
let timer = 5000;
let prevIf = [];
let events = new EventEmitter();

function _start() {
    _getInterfaces();
    interval = setInterval(() => {
        _getInterfaces();
    }, timer)
}

function _stop() {
    clearInterval(interval);
    prevIf = [];
}

function _on(event, callback) {
    events.on(event, callback);
}

function _getInterfaces() {
    let curIf = os.networkInterfaces();
    
    
    let curIfNames = Object.keys(curIf);
    let prevIfNames = Object.keys(prevIf);

    prevIf = curIf;
    _alertNew(_.difference(curIfNames, prevIfNames));
    _alertOld(_.difference(prevIfNames, curIfNames));
}

function _alertNew(interfaces) {
    interfaces.forEach(entry => {
        events.emit('added', prevIf[entry]);
    });
}

function _alertOld(interfaces) {
    interfaces.forEach(entry => {
        events.emit('removed', prevIf[entry]);
    })
}