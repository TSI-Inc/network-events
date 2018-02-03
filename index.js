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
    NewIpAddr: 'addedIpAddr'
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


function _compare(prevIfList, curIfList) {
    Object.keys(curIfList).forEach(entry => {
        if(_.has(prevIfList, entry)) {
            _compareAddresses(prevIfList[entry], curIfList[entry]);
        } else {

        }
    });
}

function _compareAddresses(prevIf, curIf) {
    curIf.forEach(entry => {
        if(!_contains(entry.address, curIf)) {
            events.emit(Events.NewIpAddr, entry);
        }
    });
}

function _contains(addr, ifObj) {
    for(let i = 0; i < ifObj.length; ++i) {
        if(ifObj[i].address === addr) return true;
    }

    return false;
}

function _getIpv4Obj(ifObj, name) {
    let ret;
    ifObj.forEach(entry => {
        if(entry.family === 'IPv4') {
            ret = entry;
            ret.name = name;
            return ret;
        }
    });

    return ret;
}

function _alertNew(interfaces) {
    interfaces.forEach(entry => {
        events.emit(Events.NewInterface, _getIpv4Obj(prevIf[entry], entry));
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
            if(!entry.address.startsWith('169.254') || entry.netmask === '255.255.255.252') {
                hasIPv4 = true;
                return true;
            }
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