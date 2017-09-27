'use strict';

const os = require('os');
const EventEmitter = require('eventemitter3');
const _ = require('lodash');

module.exports = {
    on: _on,
    start: _start, 
    stop: _stop
}

const Events = {
    NewInterface: 'addedIf',
    RemovedInterface: 'removedIf',
    NewIpv4Addr: 'newIPv4'
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
        events.emit(Events.NewInterface, prevIf[entry]);
        if(events.listeners(Events.NewIpv4Addr, true)) {
            _alertNewIPv4(prevIf[entry], entry);
        }
    });
}

function _alertNewIPv4(ifObj, name, count) {
    if(ifObj == null) return;
    if(count == null) count = 1;
    if(count > 10) {
        console.log('Interface still does not have IPv4 address after 10 tries');
        return;
    }

    let hasIPv4 = false;
    ifObj.some(entry => {
        if(entry.family === 'IPv4') {
            hasIPv4 = true;
            return true;
        }
    });

    if(hasIPv4) events.emit(Events.NewIpv4Addr, ifObj);
    else {
        setTimeout(() => {
            _alertNewIPv4(os.networkInterfaces()[name], name, count);
        }, 500);
    }
}

function _alertOld(interfaces) {
    interfaces.forEach(entry => {
        events.emit(Events.RemovedInterface, prevIf[entry]);
    })
}