module.exports = function(server) {
    var loopbackAnalytics;
    try {
        loopbackAnalytics = require('loopback-analytics');
    } catch(e) {
        process.exit('Please install loopabck analytics');
    }
    
    //  expose custom data by adding it to the `data` object and resolving 
    //  the promise when complete
    var getCustomDataCallback = function(ctx) {
        return new Promise(function(resolve,reject) {
            var data = {};
            resolve(data);
        });
    }

    loopbackAnalytics(server,{configPath: __dirname + '/../../server/config-analytics.json'},getCustomDataCallback);
}