const NetworkEvents = require('./index');

NetworkEvents.on('newIPv4', function(ip) {
    console.log('newIPv4: ', ip);
});

NetworkEvents.on('addedIf', function(ip) {
    //console.log('New IF!');
    //console.log('addedIf: ', ip);
});

NetworkEvents.on('removedIf', function(ip) {
    //console.log('removedIf: ', ip);
});

// setTimeout(() => {}, 50000000);
NetworkEvents.start();